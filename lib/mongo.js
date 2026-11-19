process.env.NODE_NO_WARNINGS = '1';
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  _id: String,
  data: mongoose.Schema.Types.Mixed
})

const User = mongoose.model("User", userSchema)

// Jika MongoDB tidak terhubung, query harus GAGAL CEPAT (bukan menggantung
// 10 detik karena buffering). Tanpa ini, perintah seperti .chess/.ww yang
// memakai saveRPG() akan menggantung sebelum bot sempat membalas.
mongoose.set("bufferCommands", false)

let mongoAvailable = true
let isConnecting = false
let mongoWarned = false

// connect() sengaja TIDAK mematikan mongoAvailable secara permanen:
// InstaBox free plan sering gagal connect saat cold start / wake-up.
// Setiap pemanggilan berikutnya akan mencoba lagi.
const connect = async () => {
  if (mongoose.connection.readyState === 1) return true
  if (isConnecting) return false

  isConnecting = true
  try {
    if (!process.env.MONGO_URI) {
      mongoAvailable = false
      isConnecting = false
      return false
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    })

    console.log("✅ MongoDB terhubung")
    mongoAvailable = true
    mongoWarned = false
    isConnecting = false
    return true
  } catch (err) {
    isConnecting = false
    // Log hanya sekali per menit agar log host tidak banjir
    if (!mongoWarned) {
      console.warn("⚠️ MongoDB belum tersedia (fallback JSON lokal):", err.message)
      mongoWarned = true
      setTimeout(() => { mongoWarned = false }, 60000).unref?.()
    }
    return false
  }
}

mongoose.connection.on("disconnected", () => { mongoAvailable = false })
mongoose.connection.on("connected", () => { mongoAvailable = true })

module.exports = { connect, User, isMongoAvailable: () => mongoAvailable }
