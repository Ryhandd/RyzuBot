const http = require('http');
http.createServer((req, res) => res.end("Ryzu Bot is Online!")).listen(process.env.PORT || 8080);

const qrcode = require("qrcode-terminal")

require("dotenv").config()
const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const chalk = require("chalk")
const readline = require("readline")

// ✅ REQUIRE HANDLER SEKALI SAJA (GLOBAL)
const ryzuHandler = require("./ryzu")

const usePairingCode = false

async function question(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve =>
    rl.question(prompt, ans => {
      rl.close()
      resolve(ans)
    })
  )
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("./RyzuSesi")
  const { version } = await fetchLatestBaileysVersion()

  const ryzu = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    version,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
  })

  // ================= EVENTS =================

  ryzu.ev.on("creds.update", saveCreds)

  ryzu.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log(chalk.magenta("Sapa Ryzu: Silakan Scan QR di bawah ini!"))
      qrcode.generate(qr, { small: true })
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow("⚠️ Reconnecting..."))
        connectToWhatsApp()
      } else {
        console.log(chalk.red("❌ Logged out"))
      }
    }

    if (connection === "open") {
      console.log(chalk.green("✔ Bot Berhasil Terhubung Ke WhatsApp"))
    }
  })

  // ✅ EVENT PESAN (DI SINI SAJA)
  ryzu.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg?.message) return
    if (msg.key.fromMe) return

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if (!body) return

    console.log(
      chalk.yellow.bold("Credit : Ryzu"),
      chalk.green.bold("[ WhatsApp ]"),
      chalk.cyan(msg.pushName || "Ryzu"),
      chalk.white(" : "),
      chalk.white(body)
    )

    // ✅ PANGGIL HANDLER
    ryzuHandler(ryzu, m)
  })
}

connectToWhatsApp()
