<<<<<<< HEAD
module.exports = {
    name: "hidetag",
    alias: ["h", "ht"],
    execute: async ({ ryzu, from, isGroup, isAdmin, isCreator, participants, q, msg, quoted }) => {
        // 1. Cek Keamanan
        if (!isGroup) return;
        if (!isAdmin && !isCreator) return;

        // 2. Ambil semua JID peserta
        const jids = participants.map(v => v.id);

        // 3. Logika Pengiriman
        if (quoted) {
            // Jika hidetag dengan cara reply pesan (gambar/sticker/teks orang lain)
            await ryzu.sendMessage(from, { 
                forward: quoted, 
                contextInfo: { 
                    mentionedJid: jids,
                    externalAdReply: null // Biar bersih dari link tirto/preview
                } 
            });
        } else {
            // Jika hidetag teks biasa
            await ryzu.sendMessage(from, { 
                text: q ? q : '', 
                mentions: jids 
            }, { quoted: msg });
        }
    }
=======
module.exports = {
    name: "hidetag",
    alias: ["h", "ht"],
    execute: async ({ ryzu, from, isGroup, isAdmin, isCreator, participants, q, msg, quoted }) => {
        // 1. Cek Keamanan
        if (!isGroup) return;
        if (!isAdmin && !isCreator) return;

        // 2. Ambil semua JID peserta
        const jids = participants.map(v => v.id);

        // 3. Logika Pengiriman
        if (quoted) {
            // Jika hidetag dengan cara reply pesan (gambar/sticker/teks orang lain)
            await ryzu.sendMessage(from, { 
                forward: quoted, 
                contextInfo: { 
                    mentionedJid: jids,
                    externalAdReply: null // Biar bersih dari link tirto/preview
                } 
            });
        } else {
            // Jika hidetag teks biasa
            await ryzu.sendMessage(from, { 
                text: q ? q : '', 
                mentions: jids 
            }, { quoted: msg });
        }
    }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
};