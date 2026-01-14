const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "tekateki",
    execute: async ({ ryzu, from, reply }) => {

        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from]) return reply("Masih ada game berjalan!");

        const soal = db.dbTekaTeki[Math.floor(Math.random() * db.dbTekaTeki.length)];

        ryzu.game[from] = {
            tipe: 'tekateki',
            soal: soal.soal,
            jawaban: soal.jawaban.toLowerCase().trim(),
            timeout: setTimeout(() => {
                reply(`⏰ Waktu habis!\nJawaban: *${soal.jawaban}*`);
                delete ryzu.game[from];
            }, 180000)
        };

        reply(`*TEKA TEKI*\n\n${soal.soal}`);
    }
};
