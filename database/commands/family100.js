<<<<<<< HEAD
const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "family100",
    execute: async ({ ryzu, from, reply }) => {

        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from]) return reply("Masih ada game berjalan!");

        const soal = db.dbFamily100[Math.floor(Math.random() * db.dbFamily100.length)];

        ryzu.game[from] = {
            tipe: 'family100',
            soal: soal.soal,
            jawaban: soal.jawaban.map(v => v.toLowerCase().trim()),
            jawaban_asli: soal.jawaban,
            terjawab: [],
            penjawab: {},
            timeout: setTimeout(() => {
                let teks = `⏰ *WAKTU HABIS*\n\n`;
                soal.jawaban.forEach((j, i) => {
                    teks += `${i + 1}. ${j}\n`;
                });
                reply(teks);
                delete ryzu.game[from];
            }, 180000)
        };

        let caption = `*FAMILY 100*\n\n📝 ${soal.soal}\n\n`;
        soal.jawaban.forEach((_, i) => caption += `${i + 1}. ??\n`);
        reply(caption);
    }
};
=======
const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));

module.exports = {
    name: "family100",
    execute: async ({ ryzu, from, reply }) => {

        if (!ryzu.game) ryzu.game = {};
        if (ryzu.game[from]) return reply("Masih ada game berjalan!");

        const soal = db.dbFamily100[Math.floor(Math.random() * db.dbFamily100.length)];

        ryzu.game[from] = {
            tipe: 'family100',
            soal: soal.soal,
            jawaban: soal.jawaban.map(v => v.toLowerCase().trim()),
            jawaban_asli: soal.jawaban,
            terjawab: [],
            penjawab: {},
            timeout: setTimeout(() => {
                let teks = `⏰ *WAKTU HABIS*\n\n`;
                soal.jawaban.forEach((j, i) => {
                    teks += `${i + 1}. ${j}\n`;
                });
                reply(teks);
                delete ryzu.game[from];
            }, 180000)
        };

        let caption = `*FAMILY 100*\n\n📝 ${soal.soal}\n\n`;
        soal.jawaban.forEach((_, i) => caption += `${i + 1}. ??\n`);
        reply(caption);
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
