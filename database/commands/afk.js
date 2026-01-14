<<<<<<< HEAD
module.exports = {
    name: "afk",
    alias: ["off"],
    execute: async ({ q, sender, from, msg, funcs, ryzu }) => {
        if (!global.rpg[sender]) funcs.checkUser(sender);

        global.rpg[sender].afk = Date.now();
        global.rpg[sender].afkReason = q || "Tanpa Alasan";

        funcs.saveRPG();

        ryzu.sendMessage(from, {
            text:
                `📴 *AFK MODE*\n\n` +
                `Berhasil! @${sender.split('@')[0]} sekarang AFK.\n` +
                `Alasan: ${global.rpg[sender].afkReason}`,
            mentions: [sender]
        }, { quoted: msg });
    }
};
=======
module.exports = {
    name: "afk",
    alias: ["off"],
    execute: async ({ q, sender, pushname, reply, funcs }) => {
        if (!global.rpg[sender]) funcs.checkUser(sender);
        
        global.rpg[sender].afk = Date.now();
        global.rpg[sender].afkReason = q || "Tanpa Alasan";
        
        reply(`📴 *AFK MODE*\n\nBerhasil! @${sender.split('@')[0]} sekarang AFK.\nAlasan: ${global.rpg[sender].afkReason}`);
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
