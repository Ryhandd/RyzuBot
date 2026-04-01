const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "asahotak",
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (!ryzu.game[from]) ryzu.game[from] = {};

        if (ryzu.game[from]['asahotak']) {
            return reply("Masih ada Asah Otak lain yang berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbAsahOtak;
        if (!pick) return reply("❌ Database Asah Otak tidak ditemukan.");

        const soal = pick[Math.floor(Math.random() * pick.length)];

        let caption = `*ASAH OTAK*\n\n`;
        caption += `📝 Soal: ${soal.soal}\n\n`;
        caption += `⏳ Waktu: 3 Menit\n`;
        caption += `💡 Balas/Reply pesan ini & ketik *.hint* untuk bantuan\n`;
        caption += `🏳️ Balas/Reply pesan ini & ketik *nyerah* untuk menyerah`;

        let kirimSoal = await ryzu.sendMessage(from, { text: caption }, { quoted: msg });

        ryzu.game[from]['asahotak'] = {
            id: kirimSoal.key.id,
            tipe: 'asahotak',
            soal: soal.soal,
            jawaban: soal.jawaban.toLowerCase().trim(),
            jawaban_asli: soal.jawaban,
            timeout: setTimeout(() => {
                if (ryzu.game[from] && ryzu.game[from]['asahotak']) {
                    ryzu.sendMessage(from, {
                        text: `⏰ *WAKTU HABIS*\n\nJawaban: *${soal.jawaban}*`
                    }, { quoted: kirimSoal });
                    delete ryzu.game[from]['asahotak'];
                }
            }, 180000)
        };
    }
};