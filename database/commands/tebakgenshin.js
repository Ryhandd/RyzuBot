const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tebakgenshin",
    alias: ["genshin", "tebakgi"],
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (!ryzu.game[from]) ryzu.game[from] = {};

        if (ryzu.game[from]['tebakgenshin']) {
            return reply("Masih ada Tebak Karakter Genshin lain yang berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbGenshin;
        if (!pick || !Array.isArray(pick)) {
            return reply("❌ Database Tebak Genshin tidak ditemukan.");
        }

        const soal = pick[Math.floor(Math.random() * pick.length)];
        const deskripsi = `🔰 ${soal.deskripsi}`;

        let caption = `🎮 *TEBAK GENSHIN IMPACT*\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Balas/Reply pesan ini & ketik *.hint* untuk bantuan\n`;
        caption += `🏳️ Balas/Reply pesan ini & ketik *nyerah* untuk menyerah`;

        let kirimSoal = await ryzu.sendMessage(from, {
            image: { url: soal.img },
            caption
        }, { quoted: msg });

        ryzu.game[from]['tebakgenshin'] = {
            id: kirimSoal.key.id,
            tipe: 'tebakgenshin',
            soal: soal.img,
            jawaban: soal.jawaban.toLowerCase().trim(),
            jawaban_asli: soal.jawaban,
            deskripsi,
            timeout: setTimeout(() => {
                if (ryzu.game[from] && ryzu.game[from]['tebakgenshin']) {
                    ryzu.sendMessage(from, {
                        text: `⏰ *WAKTU HABIS*\n\n🗝️ Jawaban: *${soal.jawaban}*`
                    }, { quoted: kirimSoal });
                    delete ryzu.game[from]['tebakgenshin'];
                }
            }, 180000)
        };
    }
};