<<<<<<< HEAD
module.exports = {
    name: "kick",
    execute: async ({
        ryzu, from, reply, msg,
        isGroup, isAdmin
    }) => {

        if (!isGroup) return reply("❌ Khusus grup.");
        if (!isAdmin) return reply("❌ Admin only.");

        const ctx = msg.message?.extendedTextMessage?.contextInfo;

        let target =
            ctx?.mentionedJid?.[0] ||
            ctx?.participant;

        if (!target)
            return reply("❌ Tag atau reply member yang mau di-kick.");

        try {
            await ryzu.groupParticipantsUpdate(from, [target], "remove");
            reply(`✅ Berhasil kick @${target.split('@')[0]}`, {
                mentions: [target]
            });
        } catch (e) {
            console.error(e);
            reply("❌ Gagal kick.");
        }
    }
};
=======
module.exports = {
    name: "kick",
    execute: async ({
        ryzu, from, reply, msg,
        isGroup, isAdmin
    }) => {

        if (!isGroup) return reply("❌ Khusus grup.");
        if (!isAdmin) return reply("❌ Admin only.");

        const ctx = msg.message?.extendedTextMessage?.contextInfo;

        let target =
            ctx?.mentionedJid?.[0] ||
            ctx?.participant;

        if (!target)
            return reply("❌ Tag atau reply member yang mau di-kick.");

        try {
            await ryzu.groupParticipantsUpdate(from, [target], "remove");
            reply(`✅ Berhasil kick @${target.split('@')[0]}`, {
                mentions: [target]
            });
        } catch (e) {
            console.error(e);
            reply("❌ Gagal kick.");
        }
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
