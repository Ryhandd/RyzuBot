const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  _id: String,
  data: mongoose.Schema.Types.Mixed
})

const User = mongoose.model("User", userSchema)

const connect = async () => {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(process.env.MONGODB_URI)
  console.log("✅ MongoDB terhubung")
}

module.exports = { connect, User }