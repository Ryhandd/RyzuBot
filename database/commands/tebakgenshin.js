const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tebakgenshin",
    alias: ["genshin", "tebakgi"],
    execute: async ({ ryzu, from, reply, msg }) => {

        // === INIT GAME OBJECT ===
        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from] && ryzu.game[from].type === 'tebakgenshin') {
            return reply("Masih ada Tebak Karakter Genshin lain yang berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbGenshin;
        if (!pick || !Array.isArray(pick)) {
            return reply("❌ Database Tebak Genshin tidak ditemukan.");
        }

        // === RANDOM SOAL ===
        const soal = pick[Math.floor(Math.random() * pick.length)];

        // === DESKRIPSI ===
        const deskripsi = `🔰 ${soal.deskripsi}`;

        // === SIMPAN ROOM GAME ===
        ryzu.game[from] = {
            tipe: 'tebakgenshin',
            soal: soal.img,
            jawaban: soal.jawaban.toLowerCase().trim(),
            jawaban_asli: soal.jawaban,
            deskripsi,
            timeout: setTimeout(() => {
                if (ryzu.game[from]) {
                    ryzu.sendMessage(from, {
                        text: `⏰ *WAKTU HABIS*\n\n🗝️ Jawaban: *${soal.jawaban}*`
                    }, { quoted: msg });
                    delete ryzu.game[from];
                }
            }, 180000) // 3 menit
        };

        // === TAMPILAN GAME ===
        let caption = `🎮 *TEBAK GENSHIN IMPACT*\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Gunakan *.hint* untuk bantuan\n`;
        caption += `🏳️ Ketik *nyerah* untuk menyerah`;

        // === KIRIM GAMBAR ===
        return ryzu.sendMessage(from, {
            image: { url: soal.img },
            caption
        }, { quoted: msg });
    }
};
