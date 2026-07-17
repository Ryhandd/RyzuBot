const axios = require("axios")

module.exports = {
  name: "tiktok",
  alias: ["tt", "ttdl"],
  execute: async (ctx) => {
    const { ryzu, from, msg, q, reply } = ctx
    if (!q) return reply("Masukkan link TikTok!\nContoh: *.tiktok https://www.tiktok.com/@mrbeast/video/7319985929286815022*")

    await ryzu.sendMessage(from, { text: "⌛ Sedang memproses video TikTok..." }, { quoted: msg })

    let dlUrl = null
    let musicUrl = null
    let title = "TikTok Video"

    // 1️⃣ Coba TikTok V2
    try {
      const res = await axios.get(`https://api.siputzx.my.id/api/d/tiktok/v2?url=${encodeURIComponent(q)}`)
      if (res.data && res.data.status && res.data.data) {
        const data = res.data.data
        dlUrl = data.no_watermark_link || data.no_watermark_link_hd || data.watermark_link
        musicUrl = data.music_link || null
        title = data.text || title
      }
    } catch (e) {
      console.error("TikTok V2 failed:", e.message)
    }

    // 2️⃣ Fallback ke TikTok V1
    if (!dlUrl) {
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(q)}`)
        if (res.data && res.data.status && res.data.data) {
          const data = res.data.data
          dlUrl = data.no_watermark || data.watermark || data.video
          title = data.title || title
        }
      } catch (e) {
        console.error("TikTok V1 failed:", e.message)
      }
    }

    // 3️⃣ Fallback ke SaveFrom
    if (!dlUrl) {
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/d/savefrom?url=${encodeURIComponent(q)}`)
        if (res.data && res.data.status && res.data.data?.[0]) {
          const firstItem = res.data.data[0]
          if (firstItem.type === "success" && firstItem.data?.[0]) {
            const item = firstItem.data[0]
            title = item.meta?.title || title
            const urls = item.url || []
            const dlObj = urls.find(u => (u.ext === 'mp4' || u.name === 'MP4') && (u.downloadable || u.isConverterUI))
                          || urls.find(u => u.url)
            if (dlObj) dlUrl = dlObj.url
          }
        }
      } catch (e) {
        console.error("TikTok SaveFrom failed:", e.message)
      }
    }

    if (!dlUrl) return reply("❌ Gagal mendownload video TikTok. Server sedang sibuk atau URL tidak valid.")

    try {
      await ryzu.sendMessage(from, {
        video: { url: dlUrl },
        caption: `✅ *TikTok Downloader*\n\n📌 Caption: ${title}`
      }, { quoted: msg })

      if (musicUrl) {
        await ryzu.sendMessage(from, {
          audio: { url: musicUrl },
          mimetype: "audio/mp4",
          fileName: `${title}.mp3`
        }, { quoted: msg })
      }
    } catch (err) {
      console.error(err)
      reply("❌ Gagal mengirim media.")
    }
  }
}
