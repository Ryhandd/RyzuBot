const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "asahotak",
    execute: async ({ ryzu, from, reply }) => {

        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from]) {
            return reply("Masih ada game berjalan!");
        }

        const soal = db.dbAsahOtak[Math.floor(Math.random() * db.dbAsahOtak.length)];

        ryzu.game[from] = {
            tipe: 'asahotak',
            soal: soal.soal,
            jawaban: soal.jawaban.toLowerCase().trim(),
            timeout: setTimeout(() => {
                reply(`⏰ Waktu habis!\nJawaban: *${soal.jawaban}*`);
                delete ryzu.game[from];
            }, 180000)
        };

        reply(`*ASAH OTAK*\n\n${soal.soal}`);
    }
};
