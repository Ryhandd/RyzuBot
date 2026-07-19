const axios = require("axios");

module.exports = {
  name: "screenshot",
  alias: ["ss"],
  execute: async ({ ryzu, from, q, msg, reply }) => {
    if (!q) return reply("Contoh: .ss https://google.com atau .screenshot https://google.com");
    
    // Validasi URL sederhana
    let url = q.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      await reply("⏳ Sedang mengambil screenshot...");

      // Menggunakan API publik thum.io
      const ssUrl = `https://image.thum.io/get/width/1280/crop/800/${url}`;

      // Ambil response dengan axios buffer untuk validasi apakah image valid
      const response = await axios.get(ssUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      // Kirim hasil screenshot ke user
      await ryzu.sendMessage(from, { 
        image: buffer, 
        caption: `🖥️ *SCREENSHOT WEB*\n\nURL: ${url}` 
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      return reply("❌ Gagal mengambil screenshot. Pastikan URL valid dan dapat diakses.");
    }
  }
};
