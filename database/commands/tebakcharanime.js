const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tebakcharanime",
    alias: ["tca"],
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (!ryzu.game[from]) ryzu.game[from] = {};

        if (ryzu.game[from]['tebakcharanime']) {
            return reply("Masih ada Tebak Karakter Anime lain yang berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbCharAnime;
        if (!pick || !Array.isArray(pick)) {
            return reply("❌ Database Character Anime tidak ditemukan.");
        }

        const soal = pick[Math.floor(Math.random() * pick.length)];

        const deskripsi =
`🎌 Anime: ${soal.anime}
❤️ Favorit: ${soal.favorites}
📺 Muncul di Anime: ${soal.animes_from}
📖 Muncul di Manga: ${soal.mangas_from}`;

        let caption = `🎮 *TEBAK KARAKTER ANIME*\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Balas/Reply pesan ini & ketik *.hint* untuk bantuan\n`;
        caption += `🏳️ Balas/Reply pesan ini & ketik *nyerah* untuk menyerah`;

        let kirimSoal = await ryzu.sendMessage(from, {
            image: { url: soal.img },
            caption
        }, { quoted: msg });

        ryzu.game[from]['tebakcharanime'] = {
            id: kirimSoal.key.id,
            tipe: 'tebakcharanime',
            soal: soal.img,
            jawaban: soal.name.map(n => n.toLowerCase().trim()),
            jawaban_asli: soal.name,
            deskripsi,
            timeout: setTimeout(() => {
                if (ryzu.game[from] && ryzu.game[from]['tebakcharanime']) {
                    ryzu.sendMessage(from, {
                        text: `⏰ *WAKTU HABIS*\n\n🗝️ Jawaban:\n${soal.name.join(', ')}`
                    }, { quoted: kirimSoal });
                    delete ryzu.game[from]['tebakcharanime'];
                }
            }, 180000)
        };
    }
};