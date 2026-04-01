const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tebakheromlbb",
    alias: ["mlbb", "tebakml", "tebakhero"],
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from] && ryzu.game[from].type === 'tebakheromlbb') {
            return reply("Masih ada Tebak Hero MLBB lain yang berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbMlbb;
        if (!pick || !Array.isArray(pick)) {
            return reply("❌ Database Character Anime tidak ditemukan.");
        }

        const soal = pick[Math.floor(Math.random() * pick.length)];

        // ===== DESKRIPSI =====
        const deskripsi = `🏷️ Role: ${soal.role}`;

        ryzu.game[from] = {
            tipe: 'tebakcharanime',
            soal: soal.soal,
            jawaban: soal.name.map(n => n.toLowerCase().trim()),
            jawaban_asli: soal.name,
            deskripsi,
            timeout: setTimeout(() => {
                if (ryzu.game[from]) {
                    ryzu.sendMessage(from, {
                        image: { url: soal.img }, 
                        caption: `⏰ *WAKTU HABIS*\n\n🗝️ Jawaban:\n${soal.name.join(', ')}` 
                    }, { quoted: msg });
                    delete ryzu.game[from];
                }
            }, 180000)
        };

        let caption = `🎮 *TEBAK HERO MLBB*\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Gunakan *.hint* untuk bantuan\n`;
        caption += `🏳️ Ketik *nyerah* untuk menyerah`;

        return ryzu.sendMessage(from, {
            image: { url: soal.img },
            caption
        }, { quoted: msg });
    }
};
