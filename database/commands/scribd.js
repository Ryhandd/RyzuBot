const axios = require("axios")

module.exports = {
  name: "scribd",
  alias: ["scribddl"],
  async execute({ ryzu, from, msg, q, reply }) {
    if (!q) {
      return reply("Masukkan link Scribd.\nContoh:\n.scribd https://www.scribd.com/doc/123456")
    }

    reply("⏳ Mengunduh dokumen Scribd...\n(mohon tunggu, server Scribd agak berat)")

    // 🔧 normalisasi link
    const fixedUrl = q
      .replace("id.scribd.com", "www.scribd.com")
      .replace("scribd.com/document", "scribd.com/doc")

    const api = `https://api.betabotz.eu.org/api/download/scribd?url=${encodeURIComponent(
      fixedUrl
    )}&apikey=Btz-pUjTd`

    let lastError = null

    // 🔁 RETRY MAX 3x
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await axios.get(api, {
          timeout: 30000 // ⬅️ NAIKIN JADI 30 DETIK
        })

        if (!res.data || !res.data.status) {
          throw new Error("API gagal mengambil data Scribd")
        }

        const result = res.data.result
        if (!result?.download) {
          throw new Error("Link download tidak ditemukan")
        }

        const caption =
`📄 *SCRIBD DOWNLOADER*

📌 Judul : ${result.title}
📦 Ukuran : ${result.sizeKB} KB
`

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

        return // ✅ STOP KALAU SUKSES

      } catch (e) {
        lastError = e
        console.log(`SCRIBD retry ${attempt} gagal`)
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 3000)) // jeda 3 detik
        }
      }
    }

    console.error("SCRIBD FINAL ERROR:", lastError)
    reply(
      "❌ Gagal mengunduh Scribd.\n" +
      "Kemungkinan:\n" +
      "- Server Scribd sedang sibuk\n" +
      "- Dokumen DRM berat\n" +
      "- Coba ulangi beberapa saat lagi"
    )
  }
}
