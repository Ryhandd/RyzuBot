module.exports = {
    name: "limit",
    alias: ["ceklimit", "sisalimit"],
    execute: async ({ reply, sender }) => {
        const u = global.rpg[sender];
        const isPremium = u.premium ? "Infinity (Premium 💎)" : u.limit;
        
        let txt = `📊 *USER LIMIT STATUS*\n\n`;
        txt += `🔋 Status Access: *Infinity (Free Premium Mode 💎)*\n\n`;
        txt += `✨ _Saat ini semua fitur bot dan limit aktif secara gratis tanpa batasan untuk seluruh user!_`;

        await reply(txt);
    }
};