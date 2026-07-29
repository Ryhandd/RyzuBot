process.env.NODE_NO_WARNINGS = '1';
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  _id: String,
  data: mongoose.Schema.Types.Mixed
})

const User = mongoose.model("User", userSchema)

let mongoAvailable = true
let isConnecting = false

const connect = async () => {
  if (!mongoAvailable) return false
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
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    })

    console.log("✅ MongoDB terhubung")
    mongoAvailable = true
    isConnecting = false
    return true
  } catch (err) {
    mongoAvailable = false
    isConnecting = false
    console.warn("⚠️ MongoDB tidak dapat terhubung (menggunakan fallback penyimpanan lokal JSON):", err.message)
    return false
  }
}

module.exports = { connect, User, isMongoAvailable: () => mongoAvailable }