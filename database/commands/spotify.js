const axios = require("axios")

module.exports = {
  name: "spotify",
  alias: ["spotifydl", "sp", "spdl"],
  execute: async (ctx) => {
    const { ryzu, from, msg, q, reply } = ctx
    if (!q) return reply("Masukkan link Spotify!\nContoh: *.spotify https://open.spotify.com/track/4PTG3Z6ehGkBF3zI7YSpG0*")

    await ryzu.sendMessage(from, { text: "⌛ Sedang memproses lagu Spotify..." }, { quoted: msg })

    let dlUrl = null
    let title = "Spotify Song"
    let artist = ""

    // 1️⃣ Coba Spotify V2 Downloader
    try {
      const res = await axios.get(`https://api.siputzx.my.id/api/d/spotifyv2?url=${encodeURIComponent(q)}`)
      if (res.data && res.data.status && res.data.data) {
        const data = res.data.data
        dlUrl = data.link || data.download_url
        title = data.title || title
        artist = data.artist || ""
      }
    } catch (e) {
      console.error("Spotify V2 failed:", e.message)
    }

    // 2️⃣ Fallback ke Spotify V1 Downloader
    if (!dlUrl) {
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(q)}`)
        if (res.data && res.data.status && res.data.data) {
          const data = res.data.data
          dlUrl = data.link || data.download_url || data.url
          title = data.title || title
          artist = data.artist || ""
        }
      } catch (e) {
        console.error("Spotify V1 failed:", e.message)
      }
    }

    // Jika server Spotify download down, beri tahu user untuk menggunakan command .play
    if (!dlUrl) {
      return reply("❌ Gagal memproses link Spotify (Server API Spotify sedang sibuk/down).\n\n💡 *Solusi*: Anda bisa mendownload lagu ini langsung lewat YouTube dengan perintah:\n*.play [Nama Artis - Judul Lagu]*")
    }

    try {
      await ryzu.sendMessage(from, {
        audio: { url: dlUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        caption: `✅ *Spotify Downloader*\n\n📌 Judul: *${title}*\n👤 Artis: ${artist}`
      }, { quoted: msg })
    } catch (err) {
      console.error(err)
      reply("❌ Gagal mengirim audio.")
    }
  }
}
