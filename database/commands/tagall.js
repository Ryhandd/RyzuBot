module.exports = {
    name: "tagall",
    alias: ["everyone", "announcement"],
    execute: async ({ ryzu, from, reply, participants, groupMetadata, msg, body }) => {
        try {
            const metadata = groupMetadata || await ryzu.groupMetadata(from);
            const mems = participants.map(v => v.id);
            const pesan = body.slice(body.indexOf(" ") + 1).replace(body.split(" ")[0], "").trim();

            let teks = `⋙ *TAG ALL - RYZU BOT* ⋘\n\n`;
            teks += `🏘️ *Grup:* ${metadata.subject}\n`;
            teks += `📢 *Pesan:* ${pesan || 'Tidak ada pesan'}\n\n`;

            for (let mem of participants) {
                teks += ` ◦ @${mem.id.split('@')[0]}\n`;
            }

            teks += `\n___________________________________________`;

            return ryzu.sendMessage(from, {
                text: teks,
                mentions: mems,
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            return reply("❌ Gagal melakukan tagall.");
        }
    }
};