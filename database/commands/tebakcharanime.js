const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tebakcharanime",
    alias: ["tca"],
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from]) {
            return reply("🎮 Masih ada game berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbCharAnime;
        if (!pick || !Array.isArray(pick)) {
            return reply("❌ Database Character Anime tidak ditemukan.");
        }

        const soal = pick[Math.floor(Math.random() * pick.length)];

        // ===== BENTUK DESKRIPSI OTOMATIS =====
        const deskripsi =
`🎌 Anime: ${soal.anime}
❤️ Favorit: ${soal.favorites}
📺 Muncul di Anime: ${soal.animes_from}
📖 Muncul di Manga: ${soal.mangas_from}`;

        ryzu.game[from] = {
            tipe: 'tebakcharanime',
            soal: soal.img,
            jawaban: soal.name.map(n => n.toLowerCase().trim()), // ARRAY
            jawaban_asli: soal.name,
            deskripsi,
            timeout: setTimeout(() => {
                if (ryzu.game[from]) {
                    ryzu.sendMessage(from, {
                        text: `⏰ *WAKTU HABIS*\n\n🗝️ Jawaban:\n${soal.name.join(', ')}`
                    }, { quoted: msg });
                    delete ryzu.game[from];
                }
            }, 180000)
        };

        let caption = `🎮 *TEBAK KARAKTER ANIME*\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Gunakan *.hint* untuk bantuan\n`;
        caption += `🏳️ Ketik *nyerah* untuk menyerah`;

        return ryzu.sendMessage(from, {
            image: { url: soal.img },
            caption
        }, { quoted: msg });
    }
};
