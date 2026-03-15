const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  _id: String, // JID WhatsApp
  data: mongoose.Schema.Types.Mixed // semua data RPG lu
}, { _id: false })

const User = mongoose.model("User", userSchema)

const connect = async () => {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(process.env.MONGODB_URI)
  console.log("✅ MongoDB terhubung")
}

module.exports = { connect, User }