const yts = require("yt-search")
const axios = require("axios")

module.exports = {
  name: "play",
  alias: ["ytmp3", "ytmp4", "video"],
  execute: async ({ ryzu, from, msg, command, q, reply }) => {
    if (!q) return reply(`Kirim link atau judul videonya!\nContoh: *.${command} risk it all* atau *.${command} https://youtu.be/...*`)

    try {
      let videoUrl = q
      let videoTitle = "Video"
      let videoThumb = ""

      if (command === "play" || command === "video") {
        const isLink = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/)
        
        if (!isLink) {
            const search = await yts(q)
            const vid = search.videos
            if (!vid) return reply("❌ Video tidak ditemukan.")
            if (vid.seconds > 900) return reply("❌ Maksimal durasi 15 menit.") 
            
            videoUrl = vid.url
            videoTitle = vid.title
            
            const typeMsg = command === "video" ? "VIDEO" : "MP3"
            await ryzu.sendMessage(from, {
              text: `🎵 *YOUTUBE ${command.toUpperCase()}*\n\n📝 Title: ${vid.title}\n⏱ Duration: ${vid.timestamp}\n⌛ Processing ${typeMsg}...`
            }, { quoted: msg })
        } else {
            videoUrl = q
            await reply("⏳ Sedang mengambil data...")
        }
      } 
      
      else if (command === "ytmp3" || command === "ytmp4") {
        const isLink = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/)
        if (!isLink) return reply("❌ Format salah. Gunakan link YouTube untuk command ini.\nContoh: *.ytmp3 https://youtu.be/...*")
        
        videoUrl = q
        await reply("⏳ Sedang mengambil data...")
      }

      const isVideoFormat = (command === "video" || command === "ytmp4")
      const apiKey = "Btz-eMcqb"
      const endpoint = isVideoFormat ? "ytmp4" : "ytmp3"
      
      const apiUrl = `https://api.betabotz.eu.org/api/download/${endpoint}?url=${videoUrl}&apikey=${apiKey}`

      const res = await axios.get(apiUrl)
      const result = res.data?.result

      if (!result || (!result.mp3 && !result.mp4)) {
        return reply("❌ Gagal mengambil link download dari server.")
      }

      const dlUrl = isVideoFormat ? result.mp4 : result.mp3

      if (isVideoFormat) {
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