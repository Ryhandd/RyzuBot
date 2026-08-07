require("dotenv").config()
const fs = require("fs")
const chalk = require("chalk")
const { connect, User } = require("./lib/mongo")

const SESI_DIR = "./RyzuSesi"

async function resetAll() {
  console.log(chalk.yellow("🧹 Membersihkan sesi lokal dan MongoDB..."))

  if (fs.existsSync(SESI_DIR)) {
    fs.rmSync(SESI_DIR, { recursive: true, force: true })
    console.log(chalk.green("✅ Sesi lokal (RyzuSesi) telah dihapus."))
  } else {
    console.log(chalk.blue("ℹ️ Sesi lokal (RyzuSesi) tidak ditemukan."))
  }

  try {
    const connected = await connect()
    if (connected) {
      await User.findByIdAndDelete("__sesi__")
      console.log(chalk.green("✅ Sesi di MongoDB (__sesi__) telah dihapus."))
    } else {
      console.log(chalk.yellow("⚠️ Tidak terhubung ke MongoDB."))
    }
  } catch (e) {
    console.error(chalk.red("❌ Gagal menghapus sesi MongoDB:"), e.message)
  }

  console.log(chalk.cyan("\n✨ Selesai! Silakan jalankan `npm start` atau `node index.js` untuk QR / Pairing Code baru.\n"))
  process.exit(0)
}

resetAll()
