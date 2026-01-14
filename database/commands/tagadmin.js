module.exports = {
    name: "tagadmin",
    alias: ["admins", "adminlist"],
    execute: async ({ ryzu, from, reply, participants, groupMetadata, msg }) => {
        try {
            const metadata = groupMetadata || await ryzu.groupMetadata(from);

            // ADMIN
            const groupAdmins = participants
                .filter(v => v.admin !== null)
                .map(v => v.id);

            // OWNER (paling aman)
            const ownerJid =
                metadata.owner ||
                participants.find(v => v.admin === 'superadmin')?.id ||
                null;

            // SENDER
            const senderJid = msg.key.participant || msg.key.remoteJid;

            // NORMALISASI JID (WA Web kadang nambah :device)
            const normalize = jid =>
                jid ? jid.split(':')[0] : null;

            const sender = normalize(senderJid);
            const owner = normalize(ownerJid);

            // ================= TEXT =================
            let teks = `⋙ *TAG ADMIN - RYZU BOT* ⋘\n\n`;
            teks += `🏘️ *Grup:* ${metadata.subject}\n`;
            teks += `👤 *Oleh:* @${sender.split('@')[0]}\n\n`;

            if (owner) {
                teks += `👑 *Group Owner:* @${owner.split('@')[0]}\n`;
            }

            teks += `👤 *Daftar Admin:*\n`;
            groupAdmins.forEach((admin, i) => {
                teks += ` ${i + 1}. ◦ @${admin.split('@')[0]}\n`;
            });

            teks += `\n___________________________________________`;

            // ================= MENTIONS =================
            const mentions = [
                sender,
                ...(owner ? [owner] : []),
                ...groupAdmins
            ];

            // ================= SEND =================
            await ryzu.sendMessage(
                from,
                {
                    text: teks,
                    mentions
                },
                { quoted: msg }
            );

        } catch (err) {
            console.error(err);
            reply("❌ Error.");
        }
    }
};
