const { webcrypto } = require("crypto")
global.crypto = webcrypto

const http = require("http")
require("dotenv").config()

const ryzuHandler = require("./ryzu.js")

const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  delay // Tambahkan delay untuk jeda proses
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const chalk = require("chalk")
const readline = require("readline")

// Setup readline untuk input nomor
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function connectToWhatsApp() {
  // Folder sesi kamu: RyzuSesi
  const { state, saveCreds } = await useMultiFileAuthState("./RyzuSesi")
  const { version } = await fetchLatestBaileysVersion()

  const ryzu = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"], // Penting untuk pairing code
    version,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
  })

  // --- LOGIKA PAIRING CODE ---
  if (!ryzu.authState.creds.registered) {
    console.log(chalk.cyan.bold("\n[ PAIRING SYSTEM ]"))
    const phoneNumber = await question(chalk.yellow("Masukkan Nomor WhatsApp (Contoh: 628xxx): "))
    
    // Tunggu sebentar agar socket siap
    await delay(3000)
    
    try {
      const code = await ryzu.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''))
      console.log(chalk.black.bgGreen.bold(`\n KODE PAIRING ANDA: ${code} \n`))
    } catch (err) {
      console.error(chalk.red("Gagal meminta kode pairing: "), err)
    }
  }
  // ---------------------------

  ryzu.ev.on("creds.update", saveCreds)

  ryzu.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow("⚠️ Reconnecting..."))
        connectToWhatsApp()
      } else {
        console.log(chalk.red("❌ Logged out. Hapus folder RyzuSesi dan coba lagi."))
      }
    }

    if (connection === "open") {
      console.log(chalk.green("\n✔ Bot Berhasil Terhubung Ke WhatsApp"))
    }
  })

  ryzu.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg?.message) return
    
    // Logika handler kamu tetap sama
    try {
      await ryzuHandler(ryzu, m)
    } catch (e) {
      console.error("❌ Handler crash:", e)
    }
  })
}

connectToWhatsApp()