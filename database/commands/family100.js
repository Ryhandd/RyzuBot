const path = require('path');
const db = require(path.join(process.cwd(), 'database', 'games.js'));
const similarity = require('similarity');

module.exports = {
    name: "family100",
    alias: ["f100"],
    execute: async (ctx) => {
        const { ryzu, from, reply, msg, sender, funcs } = ctx;

        if (!ryzu.game) ryzu.game = {};
        if (!ryzu.game[from]) ryzu.game[from] = {};

        if (ryzu.game[from]['family100']) {
            return reply("Masih ada Family100 yang berjalan di grup ini! Jawab soal yang ada atau ketik *nyerah*.");
        }

        const listSoal = db.dbFamily100;
        if (!listSoal || listSoal.length === 0) return reply("❌ Database Family 100 tidak ditemukan atau kosong.");

        const soalRaw = listSoal[Math.floor(Math.random() * listSoal.length)];
        
        const room = {
            id: null,
            tipe: 'family100',
            soal: soalRaw.soal,
            jawaban: soalRaw.jawaban.map(v => v.toLowerCase().trim()),
            jawaban_asli: soalRaw.jawaban,
            terjawab: [],
            penjawab: {},
            isGameOver: false
        };

        let caption = `🎮 *FAMILY 100*\n\n📝 Soal: *${room.soal}*\n\n`;
        room.jawaban_asli.forEach((_, i) => caption += `${i + 1}. ???\n`);
        caption += `\n⏳ Waktu: 3 Menit\n🏳️ Ketik *nyerah* untuk menyerah.`;

        let msgSoal = await ryzu.sendMessage(from, { text: caption }, { quoted: msg });
        room.id = msgSoal.key.id;
        ryzu.game[from]['family100'] = room;

        const finishGame = async (judul) => {
            if (room.isGameOver) return;
            room.isGameOver = true;
            if (timeout) clearTimeout(timeout);
            
            let teks = `${judul}\n\n📝 Soal: *${room.soal}*\n\n🗝️ *JAWABAN:*\n`;
            room.jawaban_asli.forEach((j, i) => {
                const jid = room.penjawab[j.toLowerCase().trim()];
                teks += `${i + 1}. ${j} ${jid ? `✅ (@${jid.split('@')})` : "???"}\n`;
            });

            await ryzu.sendMessage(from, { 
                text: teks, 
                mentions: Object.values(room.penjawab) 
            }, { quoted: msgSoal });

            delete ryzu.game[from]['family100'];
            ryzu.ev.off('messages.upsert', handler);
        };

        const timeout = setTimeout(async () => {
            if (ryzu.game[from]?.['family100'] && !room.isGameOver) {
                finishGame("⏰ *WAKTU HABIS*");
            }
        }, 180000);

        const handler = async (chat) => {
            const m = chat.messages;
            if (!m || !m.message || m.key.fromMe || m.key.remoteJid !== from) return;

            const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").toLowerCase().trim();
            const senderId = m.key.participant || m.key.remoteJid;

            if (body === 'nyerah') {
                return finishGame("🏳️ *MENYERAH*");
            }

            const index = room.jawaban.findIndex(j => body === j || similarity(body, j) >= 0.85);

            if (index !== -1) {
                const jawBenar = room.jawaban[index];
                if (room.terjawab.includes(jawBenar)) return;

                room.terjawab.push(jawBenar);
                room.penjawab[jawBenar] = senderId;

                if (global.rpg && global.rpg[senderId]) {
                    global.rpg[senderId].money += 2000;
                    global.rpg[senderId].exp += 200;
                    funcs.cekLevel(senderId);
                    funcs.saveRPG(senderId).catch(() => {});
                }

                if (room.terjawab.length === room.jawaban.length) {
                    return finishGame("🎉 *SEMUA TERJAWAB*");
                }

                let updatedTeks = `✅ *BENAR!*\n\n📝 Soal: *${room.soal}*\n\n`;
                room.jawaban_asli.forEach((j, i) => {
                    const jid = room.penjawab[j.toLowerCase().trim()];
                    updatedTeks += `${i + 1}. ${jid ? `${j} ✅ (@${jid.split('@')})` : "???"}\n`;
                });
                updatedTeks += `\n💰 +2000 Money | ✨ +200 EXP`;

                await ryzu.sendMessage(from, { 
                    text: updatedTeks, 
                    mentions: Object.values(room.penjawab) 
                }, { quoted: m });
            }
        };

        ryzu.ev.on('messages.upsert', handler);
    }
};