const axios = require("axios")

module.exports = {
  name: "facebook",
  alias: ["fb", "fbdl"],
  execute: async (ctx) => {
    const { ryzu, from, msg, q, reply } = ctx
    if (!q) return reply("Masukkan link Facebook!\nContoh: *.fb https://www.facebook.com/watch/?v=1015321325432543*")

    await ryzu.sendMessage(from, { text: "⌛ Sedang memproses video Facebook..." }, { quoted: msg })

    let dlUrl = null
    let title = "Facebook Video"

    // 1️⃣ Coba SaveFrom
    try {
      const res = await axios.get(`https://api.siputzx.my.id/api/d/savefrom?url=${encodeURIComponent(q)}`)
      if (res.data && res.data.status && res.data.data?.[0]) {
        const firstItem = res.data.data[0]
        if (firstItem.type !== "error" && firstItem.data?.[0]) {
          const item = firstItem.data[0]
          title = item.meta?.title || title
          const urls = item.url || []
          const dlObj = urls.find(u => (u.ext === 'mp4' || u.name === 'MP4') && (u.downloadable || u.isConverterUI))
                        || urls.find(u => u.url)
          if (dlObj) dlUrl = dlObj.url
        }
      }
    } catch (e) {
      console.error("FB SaveFrom failed:", e.message)
    }

    // 2️⃣ Fallback ke Facebook direct endpoint
    if (!dlUrl) {
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(q)}`)
        if (res.data && res.data.status && res.data.data) {
          const data = res.data.data
          if (Array.isArray(data.video)) {
            const hdVideo = data.video.find(v => v.quality?.includes('HD') || v.quality?.includes('720'))
            const sdVideo = data.video.find(v => v.quality?.includes('SD') || v.quality?.includes('360'))
            const selectedVideo = hdVideo || sdVideo || data.video[0]
            if (selectedVideo) dlUrl = selectedVideo.url
          } else {
            dlUrl = data.video || data.hd || data.sd || data.download_url
          }
          title = data.title || title
        }
      } catch (e) {
        console.error("FB direct failed:", e.message)
      }
    }

    if (!dlUrl) return reply("❌ Gagal mendownload video Facebook. Server sedang sibuk atau postingan bersifat privat.")

    try {
      await ryzu.sendMessage(from, {
        video: { url: dlUrl },
        caption: `✅ *Facebook Downloader*\n\n📌 Judul: ${title}`
      }, { quoted: msg })
    } catch (err) {
      console.error(err)
      reply("❌ Gagal mengirim video.")
    }
  }
}
