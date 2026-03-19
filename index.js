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

let askedNumber = false

// ── BACKUP SESI KE MONGODB ──
async function backupSesi() {
  try {
    const { User, connect } = require("./lib/mongo")
    await connect()
    const sesiDir = "./RyzuSesi"
    if (!fs.existsSync(sesiDir)) return
    const sesiFiles = {}
    for (const file of fs.readdirSync(sesiDir)) {
      sesiFiles[file] = fs.readFileSync(`${sesiDir}/${file}`, "utf-8")
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
    if (sesiDoc?.data && !fs.existsSync("./RyzuSesi/creds.json")) {
      if (!fs.existsSync("./RyzuSesi")) fs.mkdirSync("./RyzuSesi", { recursive: true })
      for (const [filename, content] of Object.entries(sesiDoc.data)) {
        fs.writeFileSync(`./RyzuSesi/${filename}`, content)
      }
      console.log(chalk.green("✅ Sesi dipulihkan dari MongoDB"))
    }
  } catch (e) {
    console.error(chalk.red("Restore sesi gagal:"), e.message)
  }
}

// ── MAIN ──
async function connectToWhatsApp() {
  // Restore sesi dulu sebelum apapun
  await restoreSesi()

  const { state, saveCreds } = await useMultiFileAuthState("./RyzuSesi")
  const { version } = await fetchLatestBaileysVersion()

  const ryzu = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    },
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    version,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: false
  })

  // ── PAIRING CODE ──
  if (!ryzu.authState.creds.registered && !askedNumber) {
    askedNumber = true

    const phoneNumber = process.env.BOT_NUMBER
    if (!phoneNumber) {
      console.log(chalk.red("❌ Set BOT_NUMBER di Variables Railway!"))
      process.exit(1)
    }

    console.log(chalk.cyan.bold("\n[ RYZU PAIRING SYSTEM ]"))
    console.log(chalk.yellow(`Meminta kode untuk nomor: ${phoneNumber}`))
    await delay(3000)

    try {
      const code = await ryzu.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ""))
      console.log(chalk.black.bgGreen.bold(`\n KODE PAIRING ANDA: ${code} \n`))
      console.log(chalk.yellow("Masukkan kode ini di WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon\n"))
    } catch (err) {
      console.error(chalk.red("Gagal meminta kode pairing:"), err.message)
    }
  }

  ryzu.ev.on("creds.update", saveCreds)

  // ── CONNECTION UPDATE ──
  ryzu.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      askedNumber = true
      console.log(chalk.green("\n✅ Ryzu Bot Berhasil Terhubung ke WhatsApp!"))
      console.log(chalk.cyan(`📱 Nomor: ${ryzu.user?.id?.split(":")[0] || "Unknown"}`))
      console.log(chalk.cyan(`⏰ Waktu: ${new Date().toLocaleString("id-ID")}\n`))
      // Backup sesi setelah connect (async, jalan di background)
      backupSesi()
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const reason = lastDisconnect?.error?.output?.payload?.error
      console.log(chalk.yellow(`⚠️  Koneksi putus. Code: ${statusCode} | Reason: ${reason || "unknown"}`))

      if (statusCode === DisconnectReason.loggedOut) {
        console.log(chalk.red("❌ Logged out! Hapus folder RyzuSesi dan restart."))
        process.exit(1)
      } else if (statusCode === 405) {
        console.log(chalk.red("❌ Sesi rusak. Hapus folder RyzuSesi dan restart."))
        process.exit(1)
      } else {
        console.log(chalk.yellow("🔄 Reconnecting dalam 5 detik..."))
        setTimeout(() => connectToWhatsApp(), 5000)
      }
    }
  })

  // ── MESSAGE HANDLER ──
  ryzu.ev.on("messages.upsert", async (m) => {
    if (m.type !== "notify") return
    const msg = m.messages[0]
    if (!msg?.message) return

    try {
      await ryzuHandler(ryzu, m)
    } catch (e) {
      console.error(chalk.red("❌ Handler crash:"), e.message)
    }
  })

  // ── GRACEFUL SHUTDOWN ──
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n👋 Bot dimatikan..."))
    ryzu.end()
    process.exit(0)
  })
}

connectToWhatsApp()