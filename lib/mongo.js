process.env.NODE_NO_WARNINGS = '1';
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  _id: String,
  data: mongoose.Schema.Types.Mixed
})

const User = mongoose.model("User", userSchema)

const connect = async () => {
  try {
    if (mongoose.connection.readyState === 1) return

    await mongoose.connect(process.env.MONGO_URI)

    console.log("✅ MongoDB terhubung")
  } catch (err) {
    console.error("❌ MongoDB error:", err.message)
  }
}

module.exports = { connect, User }