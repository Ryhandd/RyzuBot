module.exports = {
    name: "demote",
    execute: async ({
        ryzu, from, reply,
        isGroup, isAdmin,
        mentionUser, quoted
    }) => {

        if (!isGroup) return reply("❌ Khusus grup.");
        if (!isAdmin) return reply("❌ Admin only.");

        // ambil target dari tag atau reply
        const target =
            mentionUser?.[0] ||
            quoted?.contextInfo?.participant;

        if (!target) return reply("❌ Tag atau reply admin yang mau di-demote.");

        try {
            await ryzu.groupParticipantsUpdate(from, [target], "demote");
            reply("✅ Berhasil demote.");
        } catch (e) {
            console.error(e);
            reply("❌ Gagal demote.");
        }
    }
};
