const yts = require("yt-search")
const axios = require("axios")

module.exports = {
  name: "play",
  alias: ["ytmp3", "ytmp4", "video"],
  execute: async ({ ryzu, from, msg, command, q, reply }) => {
    if (!q) return reply(`Kirim link atau judul videonya!\nContoh: *.${command} kokoronashi*`)

    try {
      const isVideoFormat = (command === "video" || command === "ytmp4")
      const ONEPUNYA_KEY = process.env.ONEPUNYA_KEY
      const BETA_KEY = process.env.BETA_KEY

      let videoUrl = q
      let videoTitle = "Video"
      const isLink = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/)

      if (!isLink) {
        const search = await yts(q)
        const vid = search.videos
        if (!vid) return reply("❌ Video tidak ditemukan.")
        videoUrl = vid.url
        videoTitle = vid.title
      }

      await ryzu.sendMessage(from, { 
        text: `⌛ Sedang memproses *${command.toUpperCase()}*...\n📝 Title: ${videoTitle}` 
      }, { quoted: msg })

      let dlUrl = null
      const encodedUrl = encodeURIComponent(videoUrl)

      if (!isVideoFormat) {
        try {
          console.log(`[SERVER] Mencoba Onepunya YT Music Play...`)
          const resMusic = await axios.get(`https://onepunya.qzz.io/api/search/ytmusic_play?url=${encodedUrl}&apikey=${ONEPUNYA_KEY}`)
          if (resMusic.data.status) {
            dlUrl = resMusic.data.result.mp3 || resMusic.data.result.url
          }
        } catch (e) {
          console.error(`[SERVER] YT Music Play Error.`)
        }
      }

      if (!dlUrl) {
        try {
          console.log(`[SERVER] Mencoba Onepunya YouTube Search...`)
          const resSearch = await axios.get(`https://onepunya.qzz.io/api/search/youtube?url=${encodedUrl}&apikey=${ONEPUNYA_KEY}`)
          if (resSearch.data.status) {
            const res = resSearch.data.result
            dlUrl = isVideoFormat ? (res.mp4 || res.video) : (res.mp3 || res.audio)
          }
        } catch (e) {
          console.error(`[SERVER] Onepunya Search Error.`)
        }
      }

      if (!dlUrl) {
        try {
          console.log(`[SERVER] Mencoba Betabotz...`)
          const endpoint = isVideoFormat ? "ytmp4" : "ytmp3"
          const betaRes = await axios.get(`https://api.betabotz.eu.org/api/download/${endpoint}?url=${encodedUrl}&apikey=${BETA_KEY}`)
          dlUrl = isVideoFormat ? betaRes.data?.result?.mp4 : betaRes.data?.result?.mp3
        } catch (e) {
          console.error(`[SERVER] Betabotz juga gagal.`)
        }
      }

      if (!dlUrl) return reply("❌ Gagal mendapatkan link download dari semua server.")

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