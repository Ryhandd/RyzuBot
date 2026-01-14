module.exports = {
    name: 'del',
    alias: ['delete'],
    execute: async ({ ryzu, m, msg, from, isGroup, isAdmin, quoted, reply }) => {

        if (!isGroup) return reply("❌ Khusus grup");
        if (!isAdmin) return reply("❌ Admin only");
        if (!quoted) return reply("Reply pesan yang mau dihapus.");

        try {
            await ryzu.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    fromMe: false,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                }
            });
        } catch (e) {
            reply("❌ Gagal hapus pesan.");
        }
    }
};
