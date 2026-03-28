const yts = require("yt-search")
const axios = require("axios")

module.exports = {
  name: "play",
  alias: ["ytmp3", "ytmp4"],
  execute: async ({ ryzu, from, msg, command, q, reply }) => {
    if (!q) return reply("Judul atau link YouTube-nya mana?")

    try {
      const search = await yts(q)
      const vid = search.videos[0]
      if (!vid) return reply("Video tidak ditemukan.")

      if (vid.seconds > 600)
        return reply("❌ Maksimal durasi 10 menit.")

      const isVideo = command === "ytmp4"

      await ryzu.sendMessage(from, {
        text:
          `🎵 *YOUTUBE PLAY*\n\n` +
          `📝 ${vid.title}\n` +
          `⏱ ${vid.timestamp}\n` +
          `⌛ Processing...`
      }, { quoted: msg })

      const apiUrl = `https://api.betabotz.eu.org/api/download/ytmp3?url=${vid.url}&apikey=Btz-eMcqb`

      const res = await axios.get(apiUrl)

      console.log("API RESPONSE:", res.data)

      const dlUrl = isVideo
      	? res.data?.result?.mp4
        : res.data?.result?.mp3

      if (!dlUrl) {
      	console.log("INVALID DL URL:", res.data)
        return reply("❌ Gagal mengambil link dari API.")
      }
        
      if (isVideo) {
        await ryzu.sendMessage(from, {
          video: { url: dlUrl },
          caption: `✅ ${vid.title}`
        }, { quoted: msg })
      } else {
        await ryzu.sendMessage(from, {
          audio: { url: dlUrl },
          mimetype: "audio/mpeg",
          fileName: `${vid.title}.mp3`
        }, { quoted: msg })
      }

    } catch (err) {
      console.error("PLAY ERROR:", err)
      reply("❌ Gagal memproses.")
    }
  }
}