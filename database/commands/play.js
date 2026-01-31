const yts = require("yt-search")
const axios = require("axios")
const fs = require("fs")
const path = require("path")

module.exports = {
  name: "play",
  alias: ["ytmp3", "ytmp4"],
  execute: async ({ ryzu, from, msg, command, q, reply }) => {
    if (!q) return reply("Judul atau link YouTube-nya mana?")

    try {
      const search = await yts(q)
      const vid = search.videos[0]
      if (!vid) return reply("Video tidak ditemukan.")

      const isVideo = command === "ytmp4"

      const caption =
        `🎵 *YOUTUBE PLAY*\n\n` +
        `📝 Judul: ${vid.title}\n` +
        `⏱ Durasi: ${vid.timestamp}\n` +
        `🔗 Link: ${vid.url}\n\n` +
        `⌛ Sedang mengunduh ${isVideo ? "video" : "audio"}...`

      await ryzu.sendMessage(from, { text: caption }, { quoted: msg })

      // API paling ringan
      const apiUrl = isVideo
        ? `https://api.nekolabs.web.id/downloader/youtube/v1?url=${vid.url}&format=720`
        : `https://api.nekolabs.web.id/downloader/youtube/v1?url=${vid.url}&format=mp3`

      const res = await axios.get(apiUrl)
      const dlUrl = res.data?.downloadUrl
      if (!dlUrl) return reply("Gagal mengambil link download.")

      const folder = path.join(__dirname, "..", "music")
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

      const ext = isVideo ? "mp4" : "mp3"
      const filePath = path.join(folder, `${vid.videoId}.${ext}`)

      const writer = fs.createWriteStream(filePath)
      const stream = await axios({
        url: dlUrl,
        method: "GET",
        responseType: "stream"
      })

      await new Promise((resolve, reject) => {
        stream.data.pipe(writer)
        writer.on("finish", resolve)
        writer.on("error", reject)
      })

      if (isVideo) {
        await ryzu.sendMessage(from, {
          video: { url: filePath },
          caption: `✅ ${vid.title}`
        }, { quoted: msg })
      } else {
        await ryzu.sendMessage(from, {
          audio: { url: filePath },
          mimetype: "audio/mpeg",
          fileName: `${vid.title}.mp3`
        }, { quoted: msg })
      }

      fs.unlinkSync(filePath)

    } catch (err) {
      console.error("PLAY ERROR:", err)
      reply("❌ Gagal memproses perintah play.")
    }
  }
}
