const axios = require('axios');

module.exports = {
    name: "meme",
    alias: ["memes", "darkjokes"],
    execute: async ({ ryzu, from, msg, reply, command }) => {
        try {
            // Kita pakai API yang berbeda tergantung command (meme atau darkjokes)
            let apiUrl;
            if (command === 'darkjokes') {
                apiUrl = `https://api.betabotz.eu.org/api/wallpaper/darkjokes?apikey=lann`;
            } else {
                apiUrl = `https://meme-api.com/gimme/indonesia`; // Meme Indo terbaru
            }

            reply("🔍 Mencari meme tersavage...");

            const res = await axios.get(apiUrl);
            
            // Mengambil URL gambar saja
            // API Betabotz biasanya di res.data.result, kalau meme-api di res.data.url
            let imageUrl = res.data.result || res.data.url;

            if (!imageUrl) return reply("❌ Gagal mendapatkan link gambar.");

            // Kirim gambar menggunakan URL (Link) nya langsung
            await ryzu.sendMessage(from, { 
                image: { url: imageUrl }, 
                caption: `🤣 *MEME / DARK JOKES*\nCommand: .${command}` 
            }, { quoted: msg });

        } catch (e) {
            console.log(e);
            reply("❌ Terjadi kesalahan saat mengambil meme.");
        }
    }
};