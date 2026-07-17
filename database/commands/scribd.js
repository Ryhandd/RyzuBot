const axios = require("axios")

module.exports = {
  name: "scribd",
  alias: ["scribddl"],
  async execute({ ryzu, from, msg, q, reply }) {
    if (!q) {
      return reply("Masukkan link Scribd.\nContoh:\n.scribd https://www.scribd.com/doc/557451950/Makalah-Pengantar-Teknologi-Informasi")
    }

    await ryzu.sendMessage(from, { text: "⏳ Mengunduh dokumen Scribd...\n(mohon tunggu, proses ini membutuhkan waktu)" }, { quoted: msg })

    // 🔧 normalisasi link
    const fixedUrl = q
      .replace("id.scribd.com", "www.scribd.com")
      .replace("scribd.com/document", "scribd.com/doc")

    // Dapatkan key dari env atau gunakan fallback default
    const keys = [
      process.env.BETA_KEY,
      "Btz-pUjTd",
      "lann"
    ].filter(Boolean)

    let lastError = null
    let success = false

    for (const key of keys) {
      const api = `https://api.betabotz.eu.org/api/download/scribd?url=${encodeURIComponent(fixedUrl)}&apikey=${key}`
      
      try {
        console.log(`[SCRIBD] Mencoba download dengan key: ${key}...`)
        const res = await axios.get(api, { timeout: 35000 })

        if (res.data && res.data.status) {
          const result = res.data.result
          if (result && result.download) {
            const caption = 
`📄 *SCRIBD DOWNLOADER*

📌 *Judul* : ${result.title || "Scribd Document"}
📦 *Ukuran* : ${result.sizeKB || "Unknown"} KB`

            await ryzu.sendMessage(
              from,
              {
                document: { url: result.download },
                mimetype: "application/pdf",
                fileName: `${result.title || "scribd"}.pdf`,
                caption
              },
              { quoted: msg }
            )
            success = true
            break // Selesai jika sukses
          }
        }
        
        if (res.data && res.data.message) {
          lastError = new Error(res.data.message)
        } else {
          lastError = new Error("Gagal memproses file.")
        }
      } catch (e) {
        lastError = e
        console.log(`[SCRIBD] Key ${key} gagal:`, e.message)
      }
    }

    if (!success) {
      console.error("SCRIBD FINAL ERROR:", lastError)
      
      let errMsg = "❌ Gagal mengunduh Scribd.\n\n"
      if (lastError && lastError.message && lastError.message.includes("whitelist")) {
        errMsg += "💡 *Penyebab*: IP server Bot Anda belum diwhitelist oleh penyedia API Betabotz.\n" +
                  "Silahkan daftar/masuk ke https://api.betabotz.eu.org lalu daftarkan IP Anda di pengaturan profil."
      } else {
        errMsg += "Kemungkinan:\n" +
                  "- Dokumen Scribd terproteksi DRM berat\n" +
                  "- Server API sedang sibuk/down\n" +
                  "- Silahkan coba lagi nanti"
      }
      reply(errMsg)
    }
  }
}
