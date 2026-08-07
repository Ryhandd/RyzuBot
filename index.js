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
        file.startsWith("session-")
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
      console.log(chalk.green("✅ Sesi (creds & session keys) di-backup ke MongoDB"))
    }
  } catch (e) {
    console.error(chalk.red("Backup sesi gagal:"), e.message)
  }
}

// ── RESTORE SESI DARI MONGODB ──
async function restoreSesi() {
  try {
    // Jika ada flag RESET_SESSION=true di .env, hapus sesi lokal & mongo
    if (process.env.RESET_SESSION === "true") {
      console.log(chalk.yellow("⚠️ RESET_SESSION=true terdeteksi. Menghapus sesi lokal & MongoDB..."))
      hapusSesi()
      await hapusSesiMongo()
      return false
    }

    // Jika lokal sudah memiliki creds.json yang valid, pakai sesi lokal
    if (fs.existsSync(`${SESI_DIR}/creds.json`)) {
      try {
        const localCreds = JSON.parse(fs.readFileSync(`${SESI_DIR}/creds.json`, "utf-8"))
        if (localCreds?.me?.id || localCreds?.registered) {
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
      const filenames = Object.keys(sesiDoc.data)
      const hasSessionKeys = filenames.some(f => f.startsWith("session-") || f.startsWith("sender-key-"))

      // Jika MongoDB HANYA punya creds.json TANPA session keys,
      // ini adalah sesi cacat bekas bug terdahulu (penyebab utama 'No sessions').
      // Hapus sesi cacat di MongoDB agar bot melakukan pairing ulang yang bersih!
      if (!hasSessionKeys) {
        console.log(chalk.red("⚠️ Sesi MongoDB tidak memiliki session keys (sesi lama cacat). Menghapus sesi MongoDB agar bisa pairing ulang bersih..."))
        await hapusSesiMongo()
        hapusSesi()
        return false
      }

      if (!fs.existsSync(SESI_DIR)) fs.mkdirSync(SESI_DIR, { recursive: true })
      for (const [filename, content] of Object.entries(sesiDoc.data)) {
        if (
          filename === "creds.json" ||
          filename.startsWith("app-state-") ||
          filename.startsWith("sender-key-") ||
          filename.startsWith("session-")
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

// ── MAIN ──
async function connectToWhatsApp() {
  // Restore sesi dari MongoDB
  await restoreSesi()

  // Bersihkan session-*.json & sender-key-*.json stale yang memicu 'No sessions'
  cleanSessionKeys()

  const { state, saveCreds } = await useMultiFileAuthState(SESI_DIR)
  const { version } = await fetchLatestBaileysVersion()

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
    markOnlineOnConnect: false
  })

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
      console.log(chalk.green("\n✅ Ryzu Bot Berhasil Terhubung ke WhatsApp!"))
      console.log(chalk.cyan(`📱 Nomor: ${ryzu.user?.id?.split(":")[0] || "Unknown"}`))
      console.log(chalk.cyan(`⏰ Waktu: ${new Date().toLocaleString("id-ID")}\n`))
      // Backup sesi baru ke MongoDB
      backupSesi()
    }

    if (connection === "close") {
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
      } else {
        console.log(chalk.yellow("🔄 Reconnecting dalam 5 detik..."))
        setTimeout(() => connectToWhatsApp(), 5000)
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

  // ── GRACEFUL SHUTDOWN ──
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n👋 Bot dimatikan..."))
    ryzu.end()
    process.exit(0)
  })

  // ── PREVENT CRASH FROM UNHANDLED REJECTIONS / EXCEPTIONS ──
  process.on("unhandledRejection", (reason, promise) => {
    console.error(chalk.red("⚠️ Unhandled Rejection:"), reason)
  })

  process.on("uncaughtException", (err) => {
    console.error(chalk.red("⚠️ Uncaught Exception:"), err)
  })
}

connectToWhatsApp()