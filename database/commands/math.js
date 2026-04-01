const { dbMath } = require('../games');

module.exports = {
    name: "math",
    alias: ["matematika", "hitungan"],
    execute: async ({ ryzu, from, reply, msg, args }) => {

        if (!ryzu.game) ryzu.game = {};
        if (!ryzu.game[from]) ryzu.game[from] = {};

        if (ryzu.game[from]['math']) {
            return reply("Masih ada Math lain yang berjalan! Jawab dulu atau ketik *nyerah*.");
        }

        if (!args) {
            return reply(
`🧮 *MATH GAME*
━━━━━━━━━━━━━━

Pilih mode untuk memulai:

🎚 Mode tersedia:
• noob   → soal mudah
• easy   → soal ringan
• normal → soal standar
• hard   → soal sulit
• insane → soal gila 😈

📌 Contoh:
.math noob
.math hard`
            );
        }

        const mode = args.toLowerCase();

        const modes = {
            noob:   { exp: 500,  money: 5000 },
            easy:   { exp: 1000, money: 10000 },
            normal: { exp: 2000, money: 20000 },
            hard:   { exp: 4000, money: 40000 },
            insane: { exp: 8000, money: 80000 }
        };

        if (!modes[mode]) {
            return reply("❌ Mode tidak valid. Ketik *.math* untuk melihat daftar mode.");
        }

        const rewardExp = modes[mode].exp;
        const rewardMoney = modes[mode].money;

        const pick = dbMath[Math.floor(Math.random() * dbMath.length)];

        let teksSoal = `🧮 *MATH GAME*\n━━━━━━━━━━━━━━\n🎚 Mode: *${mode.toUpperCase()}*\n⏳ Waktu: 30 Detik\n\n❓ Soal:\n${pick.soal}\n\n🎁 Hadiah:\n💰 ${rewardMoney.toLocaleString()} Money\n✨ ${rewardExp.toLocaleString()} EXP\n\n✍️ Balas/Reply pesan ini untuk menjawab!\n🏳️ Balas/Reply pesan ini & ketik *nyerah* untuk menyerah`;

        let kirimSoal = await ryzu.sendMessage(from, { text: teksSoal }, { quoted: msg });

        ryzu.game[from]['math'] = {
            id: kirimSoal.key.id,
            tipe: 'math',
            mode,
            soal: pick.soal,
            jawaban: pick.jawaban.toString(),
            jawaban_asli: pick.jawaban.toString(),
            hadiah: {
                exp: rewardExp,
                money: rewardMoney
            },
            timeout: setTimeout(() => {
                if (ryzu.game[from] && ryzu.game[from]['math']) {
                    ryzu.sendMessage(from, {
                        text: `⏰ *WAKTU HABIS!*\n\n🧮 Soal:\n${pick.soal}\n\n✅ Jawaban:\n*${pick.jawaban}*`
                    }, { quoted: kirimSoal });
                    delete ryzu.game[from]['math'];
                }
            }, 30000)
        };
    }
};