const axios = require("axios")

module.exports = {
  name: "mediafire",
  alias: ["mfdl"],
  execute: async (ctx) => {
    const { ryzu, from, msg, q, reply } = ctx
    if (!q) return reply("Masukkan link Mediafire!\nContoh: *.mediafire https://www.mediafire.com/file/xxxxx/yyyyy.zip/file*")

    // Validasi link
    if (!q.match(/mediafire\.com\/(file|download)\//gi)) {
      return reply("❌ URL tidak valid. Pastikan link tersebut adalah link Mediafire sharing.")
    }

    await ryzu.sendMessage(from, { text: "⌛ Sedang mengambil informasi file Mediafire..." }, { quoted: msg })

    try {
      const res = await axios.get(q, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        maxRedirects: 5
      })

      const html = res.data
      
      // 1. Ekstrak direct download link
      const downloadLinkMatch = html.match(/href="((https?:)?\/\/download[^"]+\.mediafire\.com\/[^"]+)"/i) || 
                                html.match(/id="downloadButton"[^>]*href="([^"]+)"/i) ||
                                html.match(/href="([^"]+)"[^>]*id="downloadButton"/i) ||
                                html.match(/aria-label="Download file"\s+href="([^"]+)"/i)

      if (!downloadLinkMatch) {
        return reply("❌ Gagal mendapatkan direct link. File mungkin telah dihapus atau tidak dapat diakses.")
      }

      const dlUrl = downloadLinkMatch[1]

      // 2. Ekstrak nama file
      const nameMatch = html.match(/<div class="filename">([^<]+)<\/div>/i) || 
                        html.match(/promo_reader_file_name[^>]*>([^<]+)/i) || 
                        html.match(/<title>([^<]+) - MediaFire<\/title>/i)
      const fileName = nameMatch ? nameMatch[1].trim() : "mediafire_file"

      // 3. Ekstrak ukuran file
      const sizeMatch = html.match(/File size:\s*<span>([^<]+)<\/span>/i) ||
                        html.match(/<span>\(([^)]+)\)<\/span>/i) ||
                        html.match(/class="filetype"[^>]*>\s*<span>[^<]+<\/span>\s*<span>\(([^)]+)\)<\/span>/i)
      const fileSize = sizeMatch ? sizeMatch[1].trim() : "Unknown"

      // 4. Ekstrak ekstensi file
      const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/)
      const fileExt = extMatch ? extMatch[1] : "bin"

      // MimeType mapping sederhana
      let mimeType = "application/octet-stream"
      if (fileExt === "pdf") mimeType = "application/pdf"
      else if (fileExt === "zip") mimeType = "application/zip"
      else if (fileExt === "rar") mimeType = "application/vnd.rar"
      else if (fileExt === "txt") mimeType = "text/plain"
      else if (fileExt === "mp3") mimeType = "audio/mpeg"
      else if (fileExt === "mp4") mimeType = "video/mp4"

      const caption = 
`📁 *MEDIAFIRE DOWNLOADER*

📌 *Nama* : ${fileName}
📦 *Ukuran* : ${fileSize}
🔗 *Mime* : ${mimeType}

⌛ Mengirim file, mohon ditunggu...`

      await reply(caption)

      await ryzu.sendMessage(from, {
        document: { url: dlUrl },
        mimetype: mimeType,
        fileName: fileName
      }, { quoted: msg })

    } catch (err) {
      console.error("Mediafire Downloader Error:", err.message)
      reply("❌ Terjadi kesalahan saat memproses link Mediafire. Pastikan file tidak dihapus.")
    }
  }
}
