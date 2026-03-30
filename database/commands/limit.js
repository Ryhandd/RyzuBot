module.exports = {
    name: "limit",
    alias: ["ceklimit", "sisalimit"],
    execute: async ({ reply, sender }) => {
        const u = global.rpg[sender];
        const isPremium = u.premium ? "Infinity (Premium 💎)" : u.limit;
        
        let txt = `📊 *USER LIMIT STATUS*\n\n`;
        txt += `🔋 Sisa Limit: *${isPremium}*\n\n`;
        
        if (!u.premium) {
            txt += `💡 _Limit akan berkurang setiap menggunakan fitur AI atau Game. Beli limit di *.shop* atau upgrade ke Premium._`;
        } else {
            txt += `✨ _Kamu bebas menggunakan semua fitur tanpa batas!_`;
        }

        await reply(txt);
    }
};