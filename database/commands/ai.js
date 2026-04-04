const axios = require('axios');
const RyzuAI = require('../../scrape/RyzuAI');

module.exports = {
    name: "ai",
    alias: ["tanya", "ask", "chatgpt", "gpt"],
    execute: async ({ reply, q, prefix, command }) => {
        if (!q) return reply(`Contoh: ${prefix + command} apa itu coding?`);

        await reply("⏳ RyzuAI sedang berpikir...");

        try {
            const apikey = process.env.VELIXS_KEY;
            const url = `https://api.velixs.com/gpt?apikey=${apikey}&text=${encodeURIComponent(q)}`;
            
            const response = await axios.get(url);
            
            let resVelixs = response.data.result || response.data.answer || response.data.data;

            if (resVelixs) {
                const cleanText = resVelixs.replace(/[\*#]/g, "");
                return await reply(cleanText);
            } else {
                throw new Error("Velixs empty response");
            }

        } catch (e) {
            console.error("Velixs Error, switching to backup:", e.message);
            
            try {
                let resBackup = await RyzuAI(q);
                if (resBackup) {
                    const cleanText = resBackup.replace(/[\*#]/g, "");
                    await reply("*(Backup Mode)*\n\n" + cleanText);
                } else {
                    await reply("Semua layanan AI sedang gangguan, coba lagi nanti.");
                }
            } catch (err) {
                console.error(err);
                reply("❌ Terjadi kesalahan pada server AI.");
            }
        }
    }
};