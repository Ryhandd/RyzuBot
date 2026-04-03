const yts = require("yt-search")
const axios = require("axios")

module.exports = {
  name: "play",
  alias: ["ytmp3", "ytmp4"],
  execute: async ({ ryzu, from, msg, command, q, reply }) => {
    if (!q) return reply(`Kirim link atau judul videonya!\nContoh: *.${command} risk it all* atau *.${command} https://youtu.be/...*`)

    try {
      let videoUrl = q
      let videoTitle = "Video"

      if (command === "play") {
        const search = await yts(q)
        const vid = search.videos
        if (!vid) return reply("❌ Video tidak ditemukan.")
        if (vid.seconds > 900) return reply("❌ Maksimal durasi 15 menit.") // Batasan durasi
        
        videoUrl = vid.url
        videoTitle = vid.title
        
        await ryzu.sendMessage(from, {
          text: `🎵 *YOUTUBE PLAY*\n\n📝 Title: ${vid.title}\n⏱ Duration: ${vid.timestamp}\n⌛ Processing MP3...`
        }, { quoted: msg })
      } else {
        const isLink = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/)
        if (!isLink) return reply("❌ Format salah. Gunakan link YouTube untuk command ini.\nContoh: *.ytmp3 https://youtu.be/...*")
        
        videoUrl = q
        await reply("⏳ Sedang mengambil data...")
      }

      const isVideo = command === "ytmp4"
      const apiKey = "Btz-eMcqb"
      
      const endpoint = isVideo ? "ytmp4" : "ytmp3"
      const apiUrl = `https://api.betabotz.eu.org/api/download/${endpoint}?url=${videoUrl}&apikey=${apiKey}`

      const res = await axios.get(apiUrl)
      const result = res.data?.result

      if (!result || (!result.mp3 && !result.mp4)) {
        return reply("❌ Gagal mengambil link download dari server.")
      }

      const dlUrl = isVideo ? result.mp4 : result.mp3

      if (isVideo) {
        await ryzu.sendMessage(from, {
          video: { url: dlUrl },
          caption: `✅ Selesai: ${videoTitle}`
        }, { quoted: msg })
      } else {
        await ryzu.sendMessage(from, {
          audio: { url: dlUrl },
          mimetype: "audio/mpeg",
          fileName: `${videoTitle}.mp3`
        }, { quoted: msg })
      }

    } catch (err) {
      console.error("PLAY ERROR:", err)
      reply("❌ Terjadi kesalahan saat memproses permintaan.")
    }
  }
}