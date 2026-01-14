module.exports = {
    name: "tagall",
    alias: ["everyone", "announcement"],
    execute: async ({ ryzu, from, reply, participants, groupMetadata, msg, body }) => {
        try {
            const metadata = groupMetadata || await ryzu.groupMetadata(from);
            
            // 1. Ambil semua peserta (JID asli)
            const mems = participants.map(v => v.id);
            
            // 2. Ambil pesan tambahan jika ada (misal: .tagall bangun woy)
            const pesan = body.slice(body.indexOf(" ") + 1).replace(body.split(" ")[0], "").trim();

            // 3. Bangun Teks
            let teks = `⋙ *TAG ALL - RYZU BOT* ⋘\n\n`;
            teks += `🏘️ *Grup:* ${metadata.subject}\n`;
            teks += `📢 *Pesan:* ${pesan ? pesan : 'Tidak ada pesan'}\n\n`;

            for (let mem of participants) {
                teks += ` ◦ @${mem.id.split('@')[0]}\n`;
            }

            teks += `\n___________________________________________`;

            // 4. Kirim dengan contextInfo (Kunci supaya tag ALL nyala)
            return ryzu.sendMessage(from, {
                text: teks,
                mentions: mems, // Daftar JID semua member
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            return reply("❌ Gagal melakukan tagall.");
        }
    }
};