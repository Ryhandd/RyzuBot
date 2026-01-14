module.exports = {
    name: "retrieve",
    alias: ["q", "viewonce"],
    execute: async ({ ryzu, from, msg, reply, funcs }) => {
        // 1. Ambil contextInfo dari pesan yang di-reply
        const contextInfo = msg.message.extendedTextMessage?.contextInfo;
        const rawQuoted = contextInfo?.quotedMessage;
        
        if (!rawQuoted) return reply("Reply pesan sekali lihatnya.");

        let content = null;

        // 2. Deteksi struktur ViewOnce
        if (rawQuoted.viewOnceMessageV2?.message) {
            content = rawQuoted.viewOnceMessageV2.message;
        }
        else if (rawQuoted.viewOnceMessage?.message) {
            content = rawQuoted.viewOnceMessage.message;
        }
        else if (rawQuoted.imageMessage?.viewOnce || rawQuoted.videoMessage?.viewOnce) {
            content = rawQuoted;
        }

        if (!content) return reply("❌ Itu bukan pesan sekali lihat (ViewOnce).");

        try {
            const isImage = content.imageMessage;
            const isVideo = content.videoMessage;

            if (!isImage && !isVideo) return reply("❌ Format media tidak didukung.");

            await reply("🔓 Membuka pesan rahasia...");

            const type = isImage ? 'image' : 'video';
            const mediaObject = isImage || isVideo;

            // 3. Download Buffer
            const buffer = await funcs.downloadMedia(mediaObject, type);

            // 4. Ambil JID pengirim asli (Biar gak error di PC/Grup)
            const senderP = contextInfo.participant || contextInfo.remoteJid;

            // 5. Kirim Media
            if (isImage) {
                await ryzu.sendMessage(from, { 
                    image: buffer, 
                    caption: `✅ *VIEW ONCE RETRIEVED*\n\nDari: @${senderP.split('@')[0]}`,
                    mentions: [senderP]
                }, { quoted: msg });
            } else {
                await ryzu.sendMessage(from, { 
                    video: buffer, 
                    caption: `✅ *VIEW ONCE RETRIEVED*`,
                    mentions: [senderP]
                }, { quoted: msg });
            }

        } catch (e) {
            console.error("Error Q:", e);
            reply("❌ Gagal download. Pastikan fungsi downloadMedia sudah lu tambahin di ryzu.js dan bot punya akses internet stabil.");
        }
    }
};