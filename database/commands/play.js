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
      const isVideoFormat = (command === "video" || command === "ytmp4")
      const isLink = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/)

      if (!isLink) {
        const search = await yts(q)
        const vid = search.videos
        if (!vid) return reply("❌ Video tidak ditemukan.")
        if (vid.seconds > 1200) return reply("❌ Durasi terlalu panjang (Maks 20 menit).")
        
        videoUrl = vid.url
        videoTitle = vid.title
        
        const typeMsg = isVideoFormat ? "VIDEO" : "MP3"
        await ryzu.sendMessage(from, {
          text: `🎵 *YOUTUBE ${command.toUpperCase()}*\n\n📝 Title: ${vid.title}\n⏱ Duration: ${vid.timestamp}\n⌛ Sedang memproses, mohon tunggu...`
        }, { quoted: msg })
      } else {
        await reply("⏳ Sedang mengambil data...")
      }

      let dlUrl = null

      let harzEndpoints = [
        `https://api.harzrestapi.web.id/api/ytdl?url=${videoUrl}`,
        `https://api.harzrestapi.web.id/api/ytdl-v2?url=${videoUrl}`,
        `https://api.harzrestapi.web.id/api/ytdl-v3?url=${videoUrl}`,
        `https://api.harzrestapi.web.id/api/ytdl-v4?url=${videoUrl}`
      ]

      if (!isVideoFormat) {
        harzEndpoints.push(`https://api.harzrestapi.web.id/api/ytmp3?url=${videoUrl}`)
        harzEndpoints.push(`https://api.harzrestapi.web.id/api/onlymp3?url=${videoUrl}`)
        if (command === "play") {
            // Khusus play pake query search jika perlu, tapi kita utamakan URL hasil yts tadi
            harzEndpoints.push(`https://api.harzrestapi.web.id/api/onlymp3?q=${encodeURIComponent(videoTitle)}`)
        }
      }

      for (let i = 0; i < harzEndpoints.length; i++) {
        try {
          console.log(`[SERVER] Mencoba Harz API Ke-${i + 1}: ${harzEndpoints[i]}`)
          const response = await axios.get(harzEndpoints[i])
          const resData = response.data.result
          
          let tempUrl = isVideoFormat ? (resData?.mp4 || resData?.url) : (resData?.mp3 || resData?.url)
          
          if (tempUrl) {
            dlUrl = tempUrl
            console.log(`[SERVER] Berhasil menggunakan Harz API Ke-${i + 1}`)
            break
          }
        } catch (e) {
          console.error(`[SERVER] Harz API Ke-${i + 1} Gagal.`)
        }
      }

      if (!dlUrl) {
        try {
          console.log(`[SERVER] Semua Harz API Gagal. Mencoba Betabotz...`)
          const apiKey = "Btz-eMcqb"
          const endpoint = isVideoFormat ? "ytmp4" : "ytmp3"
          const betaRes = await axios.get(`https://api.betabotz.eu.org/api/download/${endpoint}?url=${videoUrl}&apikey=${apiKey}`)
          dlUrl = isVideoFormat ? betaRes.data?.result?.mp4 : betaRes.data?.result?.mp3
        } catch (e) {
          console.error(`[SERVER] Betabotz juga gagal.`)
        }
      }

      if (!dlUrl) return reply("❌ Maaf, semua server sedang sibuk. Coba lagi nanti.")

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
      reply("❌ Terjadi kesalahan fatal.")
    }
  }
}