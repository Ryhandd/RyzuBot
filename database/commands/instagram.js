const axios = require("axios")

module.exports = {
  name: "instagram",
  alias: ["ig", "igdl"],
  execute: async (ctx) => {
    const { ryzu, from, msg, q, reply } = ctx
    if (!q) return reply("Masukkan link Instagram!\nContoh: *.ig https://www.instagram.com/p/CgK7Hh_O7j_/*")

    await ryzu.sendMessage(from, { text: "⌛ Sedang memproses media Instagram..." }, { quoted: msg })

    let dlUrl = null
    let title = "Instagram Media"

    // 1️⃣ Coba SaveFrom
    try {
      const res = await axios.get(`https://api.siputzx.my.id/api/d/savefrom?url=${encodeURIComponent(q)}`)
      if (res.data && res.data.status && res.data.data?.[0]) {
        const firstItem = res.data.data[0]
        if (firstItem.type !== "error" && firstItem.data?.[0]) {
          const item = firstItem.data[0]
          title = item.meta?.title || title
          const urls = item.url || []
          const dlObj = urls.find(u => u.downloadable || u.isConverterUI || (u.url && u.url.startsWith('http')))
                        || urls.find(u => u.url)
          if (dlObj) dlUrl = dlObj.url
        }
      }
    } catch (e) {
      console.error("IG SaveFrom failed:", e.message)
    }

    // 2️⃣ Fallback ke Sssinstagram
    if (!dlUrl) {
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/d/sssinstagram?url=${encodeURIComponent(q)}`)
        if (res.data && res.data.status && res.data.data?.[0]) {
          dlUrl = res.data.data[0].url || res.data.data[0].url_download
        }
      } catch (e) {
        console.error("IG Sssinstagram failed:", e.message)
      }
    }

    // 3️⃣ Fallback ke Igram
    if (!dlUrl) {
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/d/igram?url=${encodeURIComponent(q)}`)
        if (res.data && res.data.status && res.data.data?.[0]) {
          dlUrl = res.data.data[0].url || res.data.data[0].url_download
        }
      } catch (e) {
        console.error("IG Igram failed:", e.message)
      }
    }

    // 4️⃣ Fallback ke FastDL
    if (!dlUrl) {
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/d/fastdl?url=${encodeURIComponent(q)}`)
        if (res.data && res.data.status && res.data.data?.[0]) {
          dlUrl = res.data.data[0].url || res.data.data[0].url_download
        }
      } catch (e) {
        console.error("IG FastDL failed:", e.message)
      }
    }

    if (!dlUrl) return reply("❌ Gagal mendownload media Instagram. Server sedang sibuk atau postingan bersifat privat.")

    try {
      // Periksa apakah link tersebut video atau gambar
      // Biasanya kita bisa mengirimkannya sebagai video jika url mengandung mp4 atau kita coba kirim sebagai video/image
      const isVideo = dlUrl.includes(".mp4") || dlUrl.includes("video") || q.includes("/reel/")
      
      if (isVideo) {
        await ryzu.sendMessage(from, {
          video: { url: dlUrl },
          caption: `✅ *Instagram Downloader*`
        }, { quoted: msg })
      } else {
        await ryzu.sendMessage(from, {
          image: { url: dlUrl },
          caption: `✅ *Instagram Downloader*`
        }, { quoted: msg })
      }
    } catch (err) {
      console.error(err)
      reply("❌ Gagal mengirim media.")
    }
  }
}
