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

// ── BACKUP SESI KE MONGODB ──
async function backupSesi() {
  try {
    const { User, connect } = require("./lib/mongo")
    await connect()
    if (!fs.existsSync(SESI_DIR)) return
    const sesiFiles = {}
    for (const file of fs.readdirSync(SESI_DIR)) {
      try {
        sesiFiles[file] = fs.readFileSync(`${SESI_DIR}/${file}`, "utf-8")
      } catch (_) {}
    }
    await User.findByIdAndUpdate(
      "__sesi__",
      { _id: "__sesi__", data: sesiFiles },
      { upsert: true }
    )
    console.log(chalk.green("✅ Sesi di-backup ke MongoDB"))
  } catch (e) {
    console.error(chalk.red("Backup sesi gagal:"), e.message)
  }
}

// ── RESTORE SESI DARI MONGODB ──
async function restoreSesi() {
  try {
    const { User, connect } = require("./lib/mongo")
    await connect()
    const sesiDoc = await User.findById("__sesi__")
    if (sesiDoc?.data && Object.keys(sesiDoc.data).length > 0) {
      if (!fs.existsSync(SESI_DIR)) fs.mkdirSync(SESI_DIR, { recursive: true })
      for (const [filename, content] of Object.entries(sesiDoc.data)) {
        fs.writeFileSync(`${SESI_DIR}/${filename}`, content)
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

  const { state, saveCreds } = await useMultiFileAuthState(SESI_DIR)
  const { version } = await fetchLatestBaileysVersion()

  const ryzu = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    },
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
      
      let useEnvNumber = false
      if (phoneNumber && process.stdin.isTTY) {
        let ans = ""
        while (ans !== "y" && ans !== "n" && ans !== "") {
          ans = await question(chalk.yellow(`Gunakan nomor dari .env (${phoneNumber})? (Y/n): `))
          ans = ans.trim().toLowerCase()
        }
        if (ans === "y" || ans === "") {
          useEnvNumber = true
        }
      } else if (phoneNumber) {
        useEnvNumber = true
      }

      if (!useEnvNumber) {
        phoneNumber = ""
        if (process.stdin.isTTY) {
          while (!phoneNumber) {
            phoneNumber = await question(chalk.yellow("Masukkan nomor WhatsApp Anda (contoh: 628123456789): "))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, "")
            if (!phoneNumber) {
              console.log(chalk.red("❌ Nomor tidak valid, silakan coba lagi."))
            }
          }
        } else {
          console.log(chalk.red("❌ Error: LOGIN_METHOD diset ke 'pairing' tapi BOT_NUMBER tidak diset di env, dan terminal non-interaktif!"))
          process.exit(1)
        }
      } else {
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "")
      }
      
      console.log(chalk.yellow(`Meminta kode pairing untuk nomor: ${chalk.green(phoneNumber)}`))
      await delay(3000)
      try {
        const code = await ryzu.requestPairingCode(phoneNumber)
        console.log(`\n ${chalk.yellow("KODE PAIRING ANDA:")} ${chalk.cyan.bold(code)} \n`)
        console.log(chalk.yellow("Masukkan kode ini di WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon\n"))
      } catch (err) {
        console.error(chalk.red("Gagal meminta kode pairing:"), err.message)
      }
    }
  }

  ryzu.ev.on("creds.update", saveCreds)

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
        console.error(chalk.red("❌ Handler crash:"), e.message)
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