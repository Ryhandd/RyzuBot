<<<<<<< HEAD
const Ai4Chat = require('../../scrape/Ai4Chat'); // Pastikan path filenya bener!

module.exports = {
    name: "ai",
    alias: ["tanya", "ask"],
    execute: async ({ reply, q, prefix, command }) => {
        if (!q) return reply(`Contoh: ${prefix + command} apa itu coding?`);

        await reply("⏳ Ryzu AI sedang berpikir...");

        try {
            // Panggil fungsinya (Pastikan di Ai4Chat.js pake module.exports = function...)
            let res = await Ai4Chat(q);
            
            if (res) {
                await reply(res);
            } else {
                await reply("AI nggak kasih respon, coba lagi.");
            }
        } catch (e) {
            console.error(e);
            reply("❌ Error di scraper Ai4Chat lu, cek console!");
        }
    }
=======
const Ai4Chat = require('../../scrape/Ai4Chat'); // Pastikan path filenya bener!

module.exports = {
    name: "ai",
    alias: ["tanya", "ask"],
    execute: async ({ reply, q, prefix, command }) => {
        if (!q) return reply(`Contoh: ${prefix + command} apa itu coding?`);

        await reply("⏳ Ryzu AI sedang berpikir...");

        try {
            // Panggil fungsinya (Pastikan di Ai4Chat.js pake module.exports = function...)
            let res = await Ai4Chat(q);
            
            if (res) {
                await reply(res);
            } else {
                await reply("AI nggak kasih respon, coba lagi.");
            }
        } catch (e) {
            console.error(e);
            reply("❌ Error di scraper Ai4Chat lu, cek console!");
        }
    }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
};