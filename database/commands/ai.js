const RyzuAI = require('../../scrape/RyzuAI');

module.exports = {
    name: "ai",
    alias: ["tanya", "ask"],
    execute: async ({ reply, q, prefix, command }) => {
        if (!q) return reply(`Contoh: ${prefix + command} apa itu coding?`);

        await reply("⏳ RyzuAI sedang berpikir...");

        try {
            let res = await RyzuAI(q);
            
            if (res) {
                const cleanText = res.replace(/[\*#]/g, "");
                await reply(cleanText); 
            } else {
                await reply("AI nggak kasih respon, coba lagi.");
            }
        } catch (e) {
            console.error(e);
            reply("❌ Error!");
        }
    }
};