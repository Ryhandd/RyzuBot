const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tebakheromlbb",
    alias: ["mlbb", "tebakml", "tebakhero"],
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (!ryzu.game[from]) ryzu.game[from] = {};

        if (ryzu.game[from]['tebakheromlbb']) {
            return reply("Masih ada Tebak Hero MLBB lain yang berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbMlbb;
        if (!pick || !Array.isArray(pick)) {
            return reply("❌ Database Hero MLBB tidak ditemukan."); 
        }

        const soal = pick[Math.floor(Math.random() * pick.length)];

        // ===== DESKRIPSI =====
        const deskripsi = `🏷️ Role: ${soal.role}`;

        let caption = `🎮 *TEBAK HERO MLBB*\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Balas/Reply pesan ini & ketik *.hint* untuk bantuan\n`;
        caption += `🏳️ Balas/Reply pesan ini & ketik *nyerah* untuk menyerah`;

        let kirimSoal = await ryzu.sendMessage(from, {
            image: { url: soal.soal },
            caption
        }, { quoted: msg });

        ryzu.game[from]['tebakheromlbb'] = {
            id: kirimSoal.key.id,
            tipe: 'tebakheromlbb',
            soal: soal.soal,
            img: soal.img,
            jawaban: soal.name.map(n => n.toLowerCase().trim()),
            jawaban_asli: soal.name,
            deskripsi,
            timeout: setTimeout(() => {
                if (ryzu.game[from] && ryzu.game[from]['tebakheromlbb']) {
                    ryzu.sendMessage(from, {
                        image: { url: soal.img }, 
                        caption: `⏰ *WAKTU HABIS*\n\n🗝️ Jawaban:\n${soal.name.join(', ')}` 
                    }, { quoted: kirimSoal });
                    
                    delete ryzu.game[from]['tebakheromlbb'];
                }
            }, 180000)
        };
    }
};