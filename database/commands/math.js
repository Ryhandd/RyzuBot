const { dbMath } = require('../games');

module.exports = {
    name: "math",
    alias: ["matematika", "hitungan"],
    execute: async ({ ryzu, from, reply, msg, args }) => {

        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from]) {
            return reply("🎮 Masih ada game berjalan!\nJawab dulu atau ketik *nyerah*.");
        }

        // ===== JIKA TANPA MODE =====
        if (!args[0]) {
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

        // ===== MODE CONFIG =====
        const mode = args[0].toLowerCase();

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

        // ===== AMBIL SOAL =====
        const pick = dbMath[Math.floor(Math.random() * dbMath.length)];

        // ===== SIMPAN ROOM =====
        ryzu.game[from] = {
            tipe: 'math',
            mode,
            soal: pick.soal,
            jawaban: pick.jawaban.toString(),
            hadiah: {
                exp: rewardExp,
                money: rewardMoney
            },
            timeout: setTimeout(() => {
                if (ryzu.game[from]) {
                    ryzu.sendMessage(from, {
                        text:
`⏰ *WAKTU HABIS!*

🧮 Soal:
${pick.soal}

✅ Jawaban:
*${pick.jawaban}*`
                    }, { quoted: msg });
                    delete ryzu.game[from];
                }
            }, 30000)
        };

        // ===== KIRIM SOAL =====
        reply(
`🧮 *MATH GAME*
━━━━━━━━━━━━━━
🎚 Mode: *${mode.toUpperCase()}*
⏳ Waktu: 30 Detik

❓ Soal:
${pick.soal}

🎁 Hadiah:
💰 ${rewardMoney.toLocaleString()} Money
✨ ${rewardExp.toLocaleString()} EXP

✍️ Jawab langsung di chat!
🏳️ Ketik *nyerah* untuk menyerah`
        );
    }
};
