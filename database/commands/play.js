const yts = require("yt-search")
const axios = require("axios")

module.exports = {
  name: "play",
  alias: ["ytmp3", "ytmp4", "video"],
  execute: async ({ ryzu, from, msg, command, q, reply }) => {
    if (!q) return reply(`Kirim link atau judul videonya!\nContoh: *.${command} kokoronashi*`)

    try {
      let query = q
      const isVideoFormat = (command === "video" || command === "ytmp4")
      const ONEPUNYA_KEY = process.env.ONEPUNYA_KEY
      const BETA_KEY = process.env.BETA_KEY

      await ryzu.sendMessage(from, { text: `⌛ Sedang mencari dan memproses...` }, { quoted: msg })

      let dlUrl = null
      let videoTitle = "Video"

      try {
        console.log(`[SERVER] Mencoba Onepunya Search API...`)

        const oneRes = await axios.get(`https://onepunya.qzz.io/api/search/youtube?query=${encodeURIComponent(query)}&apikey=${ONEPUNYA_KEY}`)
        
        if (oneRes.data && oneRes.data.status) {
          const result = oneRes.data.result || oneRes.data.result 
          
          videoTitle = result.title || "YouTube Media"
          dlUrl = isVideoFormat ? (result.mp4 || result.video) : (result.mp3 || result.audio)
        }
      } catch (e) {
        console.error(`[SERVER] Onepunya Search Gagal:`, e.message)
      }

      if (!dlUrl) {
        try {
          console.log(`[SERVER] Onepunya gagal, beralih ke Betabotz...`)
          
          let targetUrl = query
          if (!query.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/)) {
            const search = await yts(query)
            targetUrl = search.videos?.url
            videoTitle = search.videos?.title || videoTitle
          }

          if (targetUrl) {
            const endpoint = isVideoFormat ? "ytmp4" : "ytmp3"
            const betaRes = await axios.get(`https://api.betabotz.eu.org/api/download/${endpoint}?url=${targetUrl}&apikey=${BETA_KEY}`)
            dlUrl = isVideoFormat ? betaRes.data?.result?.mp4 : betaRes.data?.result?.mp3
          }
        } catch (e) {
          console.error(`[SERVER] Betabotz juga gagal.`)
        }
      }

      if (!dlUrl) return reply("❌ Gagal mendapatkan link download. Coba judul lain atau pastikan Apikey aktif.")

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
      reply("❌ Terjadi kesalahan pada script.")
    }
  }
}