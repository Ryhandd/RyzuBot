const { webcrypto } = require("crypto")
global.crypto = webcrypto

require("dotenv").config()
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
const readline = require("readline")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

// Track apakah sudah nanya nomor (biar gak nanya berulang)
let askedNumber = false

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("./RyzuSesi")
  const { version } = await fetchLatestBaileysVersion()

  const ryzu = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      // FIX: pakai makeCacheableSignalKeyStore biar lebih stabil
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    },
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    version,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: false // Hemat resource
  })

  // --- PAIRING CODE (hanya tanya sekali) ---
  if (!ryzu.authState.creds.registered && !askedNumber) {
    askedNumber = true
    console.log(chalk.cyan.bold("\n[ RYZU PAIRING SYSTEM ]"))
    const phoneNumber = await question(chalk.yellow("Masukkan Nomor WhatsApp (Contoh: 628xxx): "))

    await delay(3000)

    try {
      const code = await ryzu.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ""))
      console.log(chalk.black.bgGreen.bold(`\n KODE PAIRING ANDA: ${code} \n`))
      console.log(chalk.yellow("Masukkan kode ini di WhatsApp > Perangkat Tertaut > Tautkan Perangkat\n"))
    } catch (err) {
      console.error(chalk.red("Gagal meminta kode pairing:"), err.message)
    }
  }

  ryzu.ev.on("creds.update", saveCreds)

  ryzu.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const reason = lastDisconnect?.error?.output?.payload?.error

      console.log(chalk.yellow(`⚠️  Koneksi putus. Code: ${statusCode} | Reason: ${reason || "unknown"}`))

      if (statusCode === DisconnectReason.loggedOut) {
        console.log(chalk.red("❌ Logged out! Hapus folder RyzuSesi dan restart."))
        process.exit(1)
      } else if (statusCode === 405) {
        // Method Not Allowed - biasanya sesi rusak
        console.log(chalk.red("❌ Sesi rusak. Hapus folder RyzuSesi dan restart."))
        process.exit(1)
      } else {
        // Reconnect dengan delay biar gak spam
        console.log(chalk.yellow("🔄 Reconnecting dalam 5 detik..."))
        setTimeout(() => connectToWhatsApp(), 5000)
      }
    }

    if (connection === "open") {
      askedNumber = true // Reset flag
      console.log(chalk.green("\n✅ Ryzu Bot Berhasil Terhubung ke WhatsApp!"))
      console.log(chalk.cyan(`📱 Nomor: ${ryzu.user?.id?.split(":")[0] || "Unknown"}`))
      console.log(chalk.cyan(`⏰ Waktu: ${new Date().toLocaleString("id-ID")}\n`))
    }
  })

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

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n👋 Bot dimatikan dengan aman..."))
    ryzu.end()
    process.exit(0)
  })
}

connectToWhatsApp()