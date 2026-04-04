const yts = require("yt-search")
const axios = require("axios")

module.exports = {
  name: "play",
  alias: ["ytmp3", "ytmp4", "video"],
  execute: async ({ ryzu, from, msg, command, q, reply }) => {
    if (!q) return reply(`Kirim link atau judul videonya!\nContoh: *.${command} kokoronashi*`)

    try {
      let videoUrl = q
      let videoTitle = "Video"
      const isVideoFormat = (command === "video" || command === "ytmp4")
      const isLink = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/)

      const ONEPUNYA_KEY = process.env.ONEPUNYA_KEY
      const BETABOTZ_KEY = process.env.BETABOTZ_KEY

      if (!isLink) {
        const search = await yts(q)
        const vid = search.videos
        if (!vid) return reply("❌ Video tidak ditemukan.")
        videoUrl = vid.url
        videoTitle = vid.title
        
        await ryzu.sendMessage(from, {
          text: `🎵 *YOUTUBE ${command.toUpperCase()}*\n\n📝 Title: ${vid.title}\n⏱ Duration: ${vid.timestamp}\n⌛ Sedang diproses...`
        }, { quoted: msg })
      } else {
        await reply("⏳ Sedang mengambil data...")
      }

      let dlUrl = null

      try {
        console.log(`[SERVER] Mencoba Onepunya API...`)
        const oneRes = await axios.get(`https://onepunya.qzz.io/api/download/youtube?url=${videoUrl}&apikey=${ONEPUNYA_KEY}`)
        
        if (oneRes.data.status) {
          const result = oneRes.data.result
          dlUrl = isVideoFormat ? (result.mp4 || result.video) : (result.mp3 || result.audio)
        }
      } catch (e) {
        console.error(`[SERVER] Onepunya API Gagal.`)
      }

      if (!dlUrl) {
        try {
          console.log(`[SERVER] Mencoba Betabotz...`)
          const endpoint = isVideoFormat ? "ytmp4" : "ytmp3"
          const betaRes = await axios.get(`https://api.betabotz.eu.org/api/download/${endpoint}?url=${videoUrl}&apikey=${BETABOTZ_KEY}`)
          dlUrl = isVideoFormat ? betaRes.data?.result?.mp4 : betaRes.data?.result?.mp3
        } catch (e) {
          console.error(`[SERVER] Betabotz juga gagal.`)
        }
      }

      if (!dlUrl) return reply("❌ Gagal mengambil file dari semua server.")

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
      reply("❌ Terjadi kesalahan sistem.")
    }
  }
}