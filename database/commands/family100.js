const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "family100",
    execute: async ({ ryzu, from, reply, msg }) => {

        if (!ryzu.game) ryzu.game = {};
        if (!ryzu.game[from]) ryzu.game[from] = {};

        if (ryzu.game[from]['family100']) {
            return reply("Masih ada Family100 lain yang berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        const pick = db.dbFamily100;
        if (!pick) return reply("❌ Database Family 100 tidak ditemukan.");

        const soal = pick[Math.floor(Math.random() * pick.length)];

        let caption = `*FAMILY 100*\n\n📝 ${soal.soal}\n\n`;
        soal.jawaban.forEach((_, i) => caption += `${i + 1}. ??\n`);
        caption += `\n⏳ Waktu: 3 Menit`;
        caption += `\n🏳️ Ketik *nyerah* untuk menyerah`;

        let kirimSoal = await ryzu.sendMessage(from, { text: caption }, { quoted: msg });

        ryzu.game[from]['family100'] = {
            id: kirimSoal.key.id,
            tipe: 'family100',
            soal: soal.soal,
            jawaban: soal.jawaban.map(v => v.toLowerCase().trim()),
            jawaban_asli: soal.jawaban,
            terjawab: [],
            penjawab: {},
            timeout: setTimeout(() => {
                if (ryzu.game[from] && ryzu.game[from]['family100']) {
                    const room = ryzu.game[from]['family100'];
                    let teks = `⏰ *WAKTU HABIS*\n\n📝 Soal: *${room.soal}*\n\n🗝️ Jawaban:\n`;
                    room.jawaban_asli.forEach((j, i) => {
                        const p = room.penjawab?.[j.toLowerCase().trim()];
                        teks += `${i + 1}. ${j}${p ? ` ✅ @${p.split("@")[0]}` : " ❌"}\n`;
                    });
                    ryzu.sendMessage(from, { 
                        text: teks, 
                        mentions: Object.values(room.penjawab || {}) 
                    }, { quoted: kirimSoal });
                    delete ryzu.game[from]['family100'];
                }
            }, 180000)
        };
    }
};