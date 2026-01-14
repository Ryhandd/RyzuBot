<<<<<<< HEAD
module.exports = {
    name: "promote",
    execute: async ({ ryzu, from, msg, reply, isGroup, isAdmin }) => {

        if (!isGroup) return reply("❌ Khusus grup.");
        if (!isAdmin) return reply("❌ Admin only.");

        const ctx = msg.message?.extendedTextMessage?.contextInfo;
        const target = ctx?.mentionedJid?.[0] || ctx?.participant;

        if (!target)
            return reply("❌ Tag atau reply member yang mau di-promote.");

        await ryzu.groupParticipantsUpdate(from, [target], "promote");

        await ryzu.sendMessage(from, {
            text: `✅ Berhasil promote @${target.split("@")[0]}`,
            mentions: [target]
        }, { quoted: msg });
    }
};
=======
module.exports = {
    name: "promote",
    execute: async ({ ryzu, from, msg, reply, isGroup, isAdmin }) => {

        if (!isGroup) return reply("❌ Khusus grup.");
        if (!isAdmin) return reply("❌ Admin only.");

        const ctx = msg.message?.extendedTextMessage?.contextInfo;
        const target = ctx?.mentionedJid?.[0] || ctx?.participant;

        if (!target)
            return reply("❌ Tag atau reply member yang mau di-promote.");

        await ryzu.groupParticipantsUpdate(from, [target], "promote");

        await ryzu.sendMessage(from, {
            text: `✅ Berhasil promote @${target.split("@")[0]}`,
            mentions: [target]
        }, { quoted: msg });
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
