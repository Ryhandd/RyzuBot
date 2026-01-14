module.exports = {
  name: "clearcache",
  execute: async ({ reply, isCreator }) => {
    if (!isCreator)
      return reply("❌ Khusus owner!")

    global.msgCache.clear()
    reply("✅ Cache pesan berhasil dibersihkan.")
  }
}
