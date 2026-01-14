<<<<<<< HEAD
module.exports = {
  name: "clearcache",
  execute: async ({ reply, isCreator }) => {
    if (!isCreator)
      return reply("❌ Khusus owner!")

    global.msgCache.clear()
    reply("✅ Cache pesan berhasil dibersihkan.")
  }
}
=======
module.exports = {
  name: "clearcache",
  execute: async ({ reply, isCreator }) => {
    if (!isCreator)
      return reply("❌ Khusus owner!")

    global.msgCache.clear()
    reply("✅ Cache pesan berhasil dibersihkan.")
  }
}
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
