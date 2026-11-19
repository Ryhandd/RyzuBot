const { webcrypto } = require("crypto")
global.crypto = webcrypto

require("dotenv").config()
const fs = require("fs")
const ryzuHandler = require("./ryzu.js")

const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  delay,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const chalk = require("chalk")
const qrcode = require("qrcode-terminal")
const readline = require("readline")

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve) => rl.question(text, (answer) => {
    rl.close()
    resolve(answer)
  }))
}

let askedNumber = false
const SESI_DIR = "./RyzuSesi"

// ── STATUS GLOBAL UNTUK KEEP-ALIVE ──
let botConnected = false
let botStartedAt = Date.now()
let waSocket = null

// ── SILENT WEB SERVER (UPTIME ROBOT) ──
// Server HTTP super ringan: hanya membalas 200/JSON kecil, TIDAK menyentuh
// socket WhatsApp sehingga tidak menambah trafik yang bisa memicu spam-check.
// Dibuat SATU KALI saja (bukan per-reconnect) agar tidak bocor port/handler.
let httpServer = null
function startKeepAliveServer() {
  if (httpServer) return httpServer
  const http = require("http")
  const port = Number(process.env.PORT) || 3000

  httpServer = http.createServer((req, res) => {
    const url = (req.url || "/").split("?")[0]

    if (req.method === "HEAD") {
      res.writeHead(200, { "Content-Type": "text/plain" })
      return res.end()
    }

    if (url === "/health" || url === "/status") {
      res.writeHead(200, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({
        status: "ok",
        bot: botConnected ? "connected" : "disconnected",
        uptime: Math.floor((Date.now() - botStartedAt) / 1000),
        ram: Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB",
        time: new Date().toISOString()
      }))
    }

    res.writeHead(200, { "Content-Type": "text/plain" })
    res.end("RyzuBot alive")
  })

  httpServer.on("error", (e) => console.error("[KEEP-ALIVE]", e.message))
  httpServer.listen(port, () => {
    console.log(chalk.green(`🌐 Keep-alive server: http://localhost:${port}`))
  })
  return httpServer
}

// ── PEMBERSIH MEDIA LAMA (cegah disk & RAM leak) ──
function startMediaCleaner() {
  const MAX_AGE = 24 * 60 * 60 * 1000 // 24 jam
  const sweep = () => {
    const base = "./media"
    if (!fs.existsSync(base)) return
    let removed = 0
    for (const type of fs.readdirSync(base)) {
      const dir = `${base}/${type}`
      try {
        if (!fs.statSync(dir).isDirectory()) continue
        for (const file of fs.readdirSync(dir)) {
          const p = `${dir}/${file}`
          try {
            if (Date.now() - fs.statSync(p).mtimeMs > MAX_AGE) {
              fs.unlinkSync(p)
              removed++
            }
          } catch (_) {}
        }
      } catch (_) {}
    }
    if (removed) console.log(chalk.gray(`🧹 Media sweep: ${removed} file lama dihapus`))
  }
  sweep()
  const timer = setInterval(sweep, 6 * 60 * 60 * 1000)
  timer.unref?.()
}

// ── HAPUS SESI LOKAL ──
function hapusSesi() {
  if (fs.existsSync(SESI_DIR)) {
    fs.rmSync(SESI_DIR, { recursive: true, force: true })
    console.log(chalk.yellow("🗑️  Sesi lokal dihapus"))
  }
}

// ── BERSIHKAN FILE SESI SIGNAL YANG STALE/RUSAK (HANYA 0-BYTE) ──
function cleanSessionKeys() {
  if (!fs.existsSync(SESI_DIR)) return
  try {
    const files = fs.readdirSync(SESI_DIR)
    let cleaned = 0
    for (const file of files) {
      // HANYA hapus file yang 0-byte / benar-benar rusak (JANGAN hapus sender-key-*.json!)
      const filePath = `${SESI_DIR}/${file}`
      try {
        const stat = fs.statSync(filePath)
        if (stat.size === 0) {
          fs.unlinkSync(filePath)
          cleaned++
        }
      } catch (_) {}
    }
    if (cleaned > 0) {
      console.log(chalk.yellow(`🧹 Dibersihkan ${cleaned} file sesi 0-byte yang rusak`))
    }
  } catch (e) {
    console.error("Gagal membersihkan file sesi:", e.message)
  }
}

let backupTimeout = null
function debouncedBackupSesi(delayMs = 2500) {
  if (backupTimeout) clearTimeout(backupTimeout)
  backupTimeout = setTimeout(() => {
    backupSesi()
  }, delayMs)
  backupTimeout.unref?.()
}

// ── BACKUP SESI KE MONGODB ──
async function backupSesi() {
  try {
    const { User, connect } = require("./lib/mongo")
    const connected = await connect()
    if (!connected) return
    if (!fs.existsSync(SESI_DIR)) return
    const sesiFiles = {}
    for (const file of fs.readdirSync(SESI_DIR)) {
      if (
        file === "creds.json" ||
        file.startsWith("app-state-") ||
        file.startsWith("sender-key-") ||
        file.startsWith("session-") ||
        file.startsWith("pre-key-")
      ) {
        try {
          sesiFiles[file] = fs.readFileSync(`${SESI_DIR}/${file}`, "utf-8")
        } catch (_) {}
      }
    }
    if (Object.keys(sesiFiles).length > 0) {
      await User.findByIdAndUpdate(
        "__sesi__",
        { _id: "__sesi__", data: sesiFiles },
        { upsert: true }
      )
      console.log(chalk.green("✅ Sesi (creds, pre-keys & session keys) di-backup ke MongoDB"))
    }
  } catch (e) {
    console.error(chalk.red("Backup sesi gagal:"), e.message)
  }
}

// ── RESTORE SESI DARI MONGODB ──
async function restoreSesi() {
  try {
    const isResetRequested =
      process.env.RESET_SESSION === "true" ||
      process.env.RESET_SESSION === "1" ||
      fs.existsSync("./RESET_SESSION") ||
      fs.existsSync("./reset_session")

    if (isResetRequested) {
      console.log(chalk.yellow("⚠️ Permintaan RESET_SESSION terdeteksi. Menghapus sesi lokal & MongoDB..."))
      hapusSesi()
      await hapusSesiMongo()
      if (fs.existsSync("./RESET_SESSION")) try { fs.unlinkSync("./RESET_SESSION") } catch (_) {}
      if (fs.existsSync("./reset_session")) try { fs.unlinkSync("./reset_session") } catch (_) {}
      return false
    }

    // Jika lokal sudah memiliki creds.json yang valid, pakai & amankan sesi lokal
    if (fs.existsSync(`${SESI_DIR}/creds.json`)) {
      try {
        const localCreds = JSON.parse(fs.readFileSync(`${SESI_DIR}/creds.json`, "utf-8"))
        if (localCreds?.me?.id || localCreds?.registered || localCreds?.noiseKey) {
          console.log(chalk.green("✅ Sesi lokal terdeteksi & valid"))
          return true
        }
      } catch (_) {}
    }

    const { User, connect } = require("./lib/mongo")
    const connected = await connect()
    if (!connected) return false

    const sesiDoc = await User.findById("__sesi__")
    if (sesiDoc?.data && Object.keys(sesiDoc.data).length > 0) {
      if (!fs.existsSync(SESI_DIR)) fs.mkdirSync(SESI_DIR, { recursive: true })
      for (const [filename, content] of Object.entries(sesiDoc.data)) {
        if (
          filename === "creds.json" ||
          filename.startsWith("app-state-") ||
          filename.startsWith("sender-key-") ||
          filename.startsWith("session-") ||
          filename.startsWith("pre-key-")
        ) {
          fs.writeFileSync(`${SESI_DIR}/${filename}`, content)
        }
      }
      console.log(chalk.green("✅ Sesi dipulihkan dari MongoDB"))
      return true
    }
    return false
  } catch (e) {
    console.error(chalk.red("Restore sesi gagal:"), e.message)
    return false
  }
}

// ── HAPUS SESI DARI MONGODB ──
async function hapusSesiMongo() {
  try {
    const { User, connect } = require("./lib/mongo")
    await connect()
    await User.findByIdAndDelete("__sesi__")
    console.log(chalk.yellow("🗑️  Sesi MongoDB dihapus"))
  } catch (_) {}
}

// ── CLAIM INSTANCE (cegah 2 proses pakai sesi WhatsApp yang sama) ──
// InstaBox bisa menjalankan proses baru sebelum proses lama benar-benar mati.
// Dua instance dengan creds yang sama akan saling tendang (logout 401 / 405).
// Claim ini dipegang selama proses hidup lalu dilepas otomatis saat exit/crash.
const os = require("os")
const INSTANCE_ID = `${os.hostname()}-${process.pid}-${Date.now()}`
const INSTANCE_TTL_MS = 3 * 60 * 1000
let instanceTimer = null

async function claimInstance(force = process.env.FORCE_TAKEOVER === "true" || process.env.FORCE_TAKEOVER === "1") {
  try {
    const { User, connect } = require("./lib/mongo")
    if (!(await connect())) return null // Mongo mati: lanjut tanpa guard

    const now = Date.now()
    const doc = await User.findById("__instance__").catch(() => null)
    const holder = doc?.data || null
    const fresh = holder && now - Number(holder.heartbeat || 0) < INSTANCE_TTL_MS

    if (fresh && holder.id !== INSTANCE_ID && !force) {
      return { busy: true, holder }
    }

    await User.findByIdAndUpdate(
      "__instance__",
      { _id: "__instance__", data: { id: INSTANCE_ID, heartbeat: now } },
      { upsert: true }
    )
    if (instanceTimer) clearInterval(instanceTimer)
    instanceTimer = setInterval(() => {
      User.findByIdAndUpdate("__instance__", { "data.heartbeat": Date.now() }).catch(() => {})
    }, 60000)
    instanceTimer.unref?.()

    return { busy: false, tookOver: !!(fresh && holder && holder.id !== INSTANCE_ID) }
  } catch (_) {
    return null
  }
}

function releaseInstance() {
  try {
    if (instanceTimer) clearInterval(instanceTimer)
    const { User } = require("./lib/mongo")
    User.findOneAndDelete({ _id: "__instance__", "data.id": INSTANCE_ID }).catch(() => {})
  } catch (_) {}
}

// ── MAIN ──
async function connectToWhatsApp() {
  const { User, connect } = require("./lib/mongo")
  await connect()

  const claim = await claimInstance()
  if (claim?.busy) {
    console.error(chalk.red(
      `\n⛔ Instance lain masih hidup (pid ${claim.holder?.id || "?"}).\n` +
      "   Hentikan dulu instance lama, atau set FORCE_TAKEOVER=true untuk memaksa ambil alih.\n"
    ))
    process.exit(0)
  }
  if (claim?.tookOver) {
    console.log(chalk.yellow("⚠️ Instance lama sudah mati (heartbeat basi). Ambil alih sesi."))
  }

  await restoreSesi()

  // Host PaaS (InstaBox/Uptime) tidak punya TTY: matikan mode interaktif
  if (!process.stdin.isTTY) process.stdin.isTTY = false

  // Bersihkan session-*.json & sender-key-*.json stale yang memicu 'No sessions'
  cleanSessionKeys()

  const { state, saveCreds } = await useMultiFileAuthState(SESI_DIR)

  // Auto-sync ke MongoDB setiap kali Baileys memperbarui session keys / pre-keys
  const originalKeysSet = state.keys.set
  state.keys.set = async (data) => {
    await originalKeysSet(data)
    debouncedBackupSesi()
  }

  let version
  try {
    const v = await fetchLatestBaileysVersion()
    version = v.version
  } catch (_) {
    version = [2, 3000, 1015901307]
  }

  global.groupCache = global.groupCache || new Map()

  const cachedGroupMetadata = async (jid) => {
    if (!jid || !jid.endsWith("@g.us")) return null
    const cached = global.groupCache.get(jid)
    if (cached && (Date.now() - cached.time < 10 * 60 * 1000)) {
      return cached.data
    }
    try {
      const meta = await ryzu.groupMetadata(jid)
      if (meta) {
        global.groupCache.set(jid, { data: meta, time: Date.now() })
        return meta
      }
    } catch (_) {}
    return null
  }

  const ryzu = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    },
    cachedGroupMetadata,
    browser: ["Mac OS", "chrome", "121.0.6167.159"],
    version,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: false,
    // Kurangi beban RAM & trafik (aman untuk host 512MB)
    keepAliveIntervalMs: 30000,
    retryRequestDelayMs: 2000,
    maxMsgRetryCount: 3,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000
  })
  waSocket = ryzu

  let currentMethod = ""
  const isRegistered = !!(ryzu.authState?.creds?.me?.id || ryzu.authState?.creds?.registered)

  if (isRegistered) {
    askedNumber = true
    console.log(chalk.green("ℹ️ Sesi terdeteksi, menghubungkan otomatis..."))
  }

  // ── AUTHENTICATION / LOGIN SYSTEM ──
  if (!isRegistered && !askedNumber) {
    askedNumber = true
    let method = process.env.LOGIN_METHOD || ""
    let phoneNumber = process.env.BOT_NUMBER || ""

    if (!method) {
      if (process.stdin.isTTY) {
        console.log(chalk.cyan.bold("\n[ METODE LOGIN RYZU BOT ]"))
        console.log(`1. ${chalk.green("QR Code")} (Scan via WhatsApp Web)`)
        console.log(`2. ${chalk.green("Pairing Code")} (Tautkan menggunakan Nomor Telepon)`)
        
        let choice = ""
        while (choice !== "1" && choice !== "2") {
          choice = await question(chalk.yellow("Pilih metode login (1/2): "))
          choice = choice.trim()
        }
        method = choice === "1" ? "qr" : "pairing"
      } else {
        method = "qr"
      }
    }

    currentMethod = method

    if (method === "qr") {
      console.log(chalk.cyan("\n[ RYZU QR SYSTEM ]"))
      console.log(chalk.yellow("Tunggu sebentar, sedang menghasilkan QR Code..."))
    } else if (method === "pairing") {
      console.log(chalk.cyan("\n[ RYZU PAIRING SYSTEM ]"))
      
      if (process.stdin.isTTY) {
        let promptText = phoneNumber
          ? `Masukkan nomor WhatsApp Anda (atau tekan ${chalk.cyan("[ENTER]")} untuk pakai ${chalk.green(phoneNumber)} dari .env): `
          : `Masukkan nomor WhatsApp Anda (contoh: 628123456789): `

        let inputNum = ""
        while (true) {
          inputNum = await question(chalk.yellow(promptText))
          inputNum = inputNum.trim().replace(/[^0-9]/g, "")
          
          if (inputNum) {
            phoneNumber = inputNum
            break
          } else if (phoneNumber) {
            // User menekan Enter dan ada nomor default dari .env
            break
          } else {
            console.log(chalk.red("❌ Nomor tidak boleh kosong! Silakan masukkan nomor WhatsApp Anda."))
          }
        }
      } else {
        phoneNumber = (phoneNumber || "").replace(/[^0-9]/g, "")
      }

      if (!phoneNumber) {
        console.log(chalk.red("❌ Error: LOGIN_METHOD diset ke 'pairing' tapi BOT_NUMBER tidak diset di env, dan terminal non-interaktif!"))
        process.exit(1)
      }
      
      console.log(chalk.yellow(`\nMeminta kode pairing untuk nomor: ${chalk.green(phoneNumber)}...`))
      await delay(2000)
      try {
        const code = await ryzu.requestPairingCode(phoneNumber)
        console.log(`\n ${chalk.yellow("KODE PAIRING ANDA:")} ${chalk.cyan.bold(code)} \n`)
        console.log(chalk.yellow("Masukkan kode ini di WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon\n"))
      } catch (err) {
        console.error(chalk.red("Gagal meminta kode pairing:"), err.message)
      }
    }
  }

  ryzu.ev.on("creds.update", async () => {
    await saveCreds()
    await backupSesi()
  })

  // ── CONNECTION UPDATE ──
  ryzu.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr && currentMethod !== "pairing") {
      console.log(chalk.yellow("\n⚠️ Scan QR Code berikut untuk login:"))
      qrcode.generate(qr, { small: true })
    }

    if (connection === "open") {
      askedNumber = true
      botConnected = true
      console.log(chalk.green("\n✅ Ryzu Bot Berhasil Terhubung ke WhatsApp!"))
      console.log(chalk.cyan(`📱 Nomor: ${ryzu.user?.id?.split(":")[0] || "Unknown"}`))
      console.log(chalk.cyan(`⏰ Waktu: ${new Date().toLocaleString("id-ID")}\n`))
      // Backup sesi baru ke MongoDB
      backupSesi()
    }

    if (connection === "close") {
      botConnected = false
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const reason = lastDisconnect?.error?.output?.payload?.error
      console.log(chalk.yellow(`⚠️  Koneksi putus. Code: ${statusCode} | Reason: ${reason || "unknown"}`))

      if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
        console.log(chalk.red("❌ Sesi tidak valid! Menghapus sesi dan pairing ulang..."))
        // Hapus sesi lama supaya bisa pairing ulang
        hapusSesi()
        hapusSesiMongo()
        askedNumber = false
        setTimeout(() => connectToWhatsApp(), 3000)
      } else if (statusCode === 405) {
        console.log(chalk.red("❌ Sesi rusak. Menghapus sesi dan pairing ulang..."))
        hapusSesi()
        hapusSesiMongo()
        askedNumber = false
        setTimeout(() => connectToWhatsApp(), 3000)
      } else if (statusCode === DisconnectReason.restartRequired || statusCode === 515) {
        console.log(chalk.yellow("🔄 Memulihkan koneksi WhatsApp (Code 515)..."))
        setTimeout(() => connectToWhatsApp(), 1000)
      } else {
        console.log(chalk.yellow("🔄 Reconnecting dalam 3 detik..."))
        setTimeout(() => connectToWhatsApp(), 3000)
      }
    }
  })

  // ── MESSAGE HANDLER ──
  ryzu.ev.on("messages.upsert", async (m) => {
    if (m.type !== "notify") return
    
    // Proses semua pesan dalam upsert secara paralel
    const promises = m.messages.map(async (msg) => {
      if (!msg?.message) return
      try {
        await ryzuHandler(ryzu, { ...m, messages: [msg] })
      } catch (e) {
        if (e.message && (e.message.includes("No sessions") || e.message.includes("Session") || e.message.includes("bad mac"))) {
          console.warn(chalk.yellow("⚠️ Signal Session notice:"), e.message)
        } else {
          console.error(chalk.red("❌ Handler crash:"), e.message)
        }
      }
    })

    await Promise.allSettled(promises)
  })

  // ── GRACEFUL SHUTDOWN (dipasang HANYA SEKALI di bootstrap, bukan per-reconnect) ──
  return ryzu
}

// ── BOOTSTRAP: semua handler proses didaftarkan satu kali ──
startKeepAliveServer()
startMediaCleaner()

let shuttingDown = false
const gracefulShutdown = (signal) => {
  if (shuttingDown) return
  shuttingDown = true
  console.log(chalk.yellow(`\n👋 Bot dimatikan (${signal})...`))
  try { waSocket?.end?.(undefined) } catch (_) {}
  try { httpServer?.close?.() } catch (_) {}
  releaseInstance()
  setTimeout(() => process.exit(0), 1500).unref?.()
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))

process.on("unhandledRejection", (reason) => {
  const msg = String(reason?.message || reason)
  if (/No sessions|bad mac|Session error/i.test(msg)) return
  console.error(chalk.red("⚠️ Unhandled Rejection:"), reason)
})

process.on("uncaughtException", (err) => {
  console.error(chalk.red("⚠️ Uncaught Exception:"), err)
})

connectToWhatsApp().catch((e) => {
  console.error(chalk.red("❌ Gagal memulai bot:"), e)
  setTimeout(() => connectToWhatsApp().catch(() => {}), 5000)
})