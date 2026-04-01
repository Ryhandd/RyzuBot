const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tebakgambar",
    alias: ["tg"],
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (!ryzu.game[from]) ryzu.game[from] = {};

        if (ryzu.game[from]['tebakgambar']) {
            return reply("Masih ada Tebak Gambar lain yang berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbTebakGambar;
        if (!pick) return reply("❌ Database Tebak Gambar tidak ditemukan.");

        const soal = pick[Math.floor(Math.random() * pick.length)];

        let caption = `*TEBAK GAMBAR*\n\n`;
        caption += `📝 Deskripsi:\n${soal.deskripsi}\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Balas/Reply pesan ini & ketik *.hint* untuk bantuan\n`;
        caption += `🏳️ Balas/Reply pesan ini & ketik *nyerah* untuk menyerah`;

        let kirimSoal = await ryzu.sendMessage(from, {
            image: { url: soal.img },
            caption
        }, { quoted: msg });

        ryzu.game[from]['tebakgambar'] = {
            id: kirimSoal.key.id,
            tipe: 'tebakgambar',
            soal: soal.img,
            jawaban: soal.jawaban.toLowerCase().trim(),
            jawaban_asli: soal.jawaban,
            deskripsi: soal.deskripsi,
            timeout: setTimeout(() => {
                if (ryzu.game[from] && ryzu.game[from]['tebakgambar']) {
                    ryzu.sendMessage(from, {
                        text: `⏰ *WAKTU HABIS*\n\nJawaban: *${soal.jawaban}*`
                    }, { quoted: kirimSoal });
                    delete ryzu.game[from]['tebakgambar'];
                }
            }, 180000)
        };
    }
};