<<<<<<< HEAD
const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tebakgambar",
    alias: ["tg"],
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from]) {
            return reply("Masih ada game berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbTebakGambar;
        if (!pick) return reply("❌ Database Tebak Gambar tidak ditemukan.");

        const soal = pick[Math.floor(Math.random() * pick.length)];

        ryzu.game[from] = {
            tipe: 'tebakgambar',
            soal: soal.img,
            jawaban: soal.jawaban.toLowerCase().trim(),
            jawaban_asli: soal.jawaban,
            deskripsi: soal.deskripsi,
            timeout: setTimeout(() => {
                if (ryzu.game[from]) {
                    ryzu.sendMessage(from, {
                        text: `⏰ *WAKTU HABIS*\n\nJawaban: *${soal.jawaban}*`
                    }, { quoted: msg });
                    delete ryzu.game[from];
                }
            }, 180000)
        };

        let caption = `*TEBAK GAMBAR*\n\n`;
        caption += `📝 Deskripsi:\n${soal.deskripsi}\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Gunakan *.hint* untuk bantuan`;

        return ryzu.sendMessage(from, {
            image: { url: soal.img },
            caption
        }, { quoted: msg });
    }
};
=======
const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tebakgambar",
    alias: ["tg"],
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from]) {
            return reply("Masih ada game berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbTebakGambar;
        if (!pick) return reply("❌ Database Tebak Gambar tidak ditemukan.");

        const soal = pick[Math.floor(Math.random() * pick.length)];

        ryzu.game[from] = {
            tipe: 'tebakgambar',
            soal: soal.img,
            jawaban: soal.jawaban.toLowerCase().trim(),
            jawaban_asli: soal.jawaban,
            deskripsi: soal.deskripsi,
            timeout: setTimeout(() => {
                if (ryzu.game[from]) {
                    ryzu.sendMessage(from, {
                        text: `⏰ *WAKTU HABIS*\n\nJawaban: *${soal.jawaban}*`
                    }, { quoted: msg });
                    delete ryzu.game[from];
                }
            }, 180000)
        };

        let caption = `*TEBAK GAMBAR*\n\n`;
        caption += `📝 Deskripsi:\n${soal.deskripsi}\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Gunakan *.hint* untuk bantuan`;

        return ryzu.sendMessage(from, {
            image: { url: soal.img },
            caption
        }, { quoted: msg });
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
