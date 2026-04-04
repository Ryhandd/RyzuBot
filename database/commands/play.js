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

      const encodedUrl = encodeURIComponent(videoUrl)
      await ryzu.sendMessage(from, { text: `⌛ Sedang memproses *${command.toUpperCase()}*...` }, { quoted: msg })

      let dlUrl = null

      try {
        let endpoint = ""
        if (command === "play") {
          endpoint = `https://onepunya.qzz.io/api/search/ytmusic_play?url=${encodedUrl}&apikey=${ONEPUNYA_KEY}`
          console.log(`[SERVER] Mencoba Onepunya YT Music Play...`)
        } else if (command === "video") {
          endpoint = `https://onepunya.qzz.io/api/search/youtube?url=${encodedUrl}&apikey=${ONEPUNYA_KEY}`
          console.log(`[SERVER] Mencoba Onepunya YouTube Search...`)
        } else if (command === "ytmp3" || command === "ytmp4") {
          endpoint = `https://onepunya.qzz.io/api/download/youtube?url=${encodedUrl}&apikey=${ONEPUNYA_KEY}`
          console.log(`[SERVER] Mencoba Onepunya Download YouTube...`)
        }

        const oneRes = await axios.get(endpoint)
        if (oneRes.data.status) {
          const res = oneRes.data.result
          dlUrl = isVideoFormat ? (res.mp4 || res.video || res.url) : (res.mp3 || res.audio || res.url)
        }
      } catch (e) {
        console.error(`[SERVER] Onepunya API Error.`)
      }

      if (!dlUrl) {
        try {
          console.log(`[SERVER] Onepunya gagal, beralih ke Betabotz...`)
          const betaEndpoint = isVideoFormat ? "ytmp4" : "ytmp3"
          const betaRes = await axios.get(`https://api.betabotz.eu.org/api/download/${betaEndpoint}?url=${encodedUrl}&apikey=${BETA_KEY}`)
          dlUrl = isVideoFormat ? betaRes.data?.result?.mp4 : betaRes.data?.result?.mp3
        } catch (e) {
          console.error(`[SERVER] Betabotz juga gagal.`)
        }
      }

      if (!dlUrl) return reply("❌ Gagal mendapatkan link download. Semua server tidak merespon.")

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