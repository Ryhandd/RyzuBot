module.exports = {
    name: "suit",
    alias: ["suit"],
    execute: async ({ ryzu, from, sender, args, reply, isGroup, mentionUser, quotedUser, prefix }) => {
        if (!isGroup) return reply("Khusus Grup.");

        // 1. Terima Tantangan (.suit acc)
        if (args[0] === "acc") {
            if (!global.suit[from]) return reply("Gak ada tantangan suit.");
            const room = global.suit[from];
            if (room.p2 && room.p2 !== sender) return reply("Bukan buat lu.");
            
            room.status = 'playing';
            room.p2 = sender;
            
            const txt = `🎮 *SUIT DIMULAI*\n\nSilakan cek Private Chat (PC) Bot untuk memilih:\n✊ Batu\n✌️ Gunting\n✋ Kertas`;
            
            // Kirim pesan ke PC kedua pemain
            await ryzu.sendMessage(room.p1, { text: "Silakan ketik pilihanmu (Batu/Gunting/Kertas) disini." });
            await ryzu.sendMessage(room.p2, { text: "Silakan ketik pilihanmu (Batu/Gunting/Kertas) disini." });
            
            reply(txt);
            return;
        }

        // 2. Kirim Tantangan (.suit @tag)
        let target = mentionUser[0] || quotedUser;
        if (!target) return reply("Tag lawan mainmu. (.suit @tag)");
        if (target === sender) return reply("Gak bisa main sendiri.");
        
        if (global.suit[from]) return reply("Selesaikan suit yang ada dulu.");

        global.suit[from] = {
            id: from,
            p1: sender,
            p2: target,
            status: 'wait',
            p1_choose: null,
            p2_choose: null,
            waktu: setTimeout(() => {
                if (global.suit[from] && global.suit[from].status === 'wait') {
                    reply("⏰ Suit kadaluarsa.");
                    delete global.suit[from];
                }
            }, 60000) // 1 menit waktu terima
        };

        reply(`🥊 @${sender.split('@')[0]} menantang @${target.split('@')[0]} main suit!\n\nKetik *${prefix}suit acc* untuk menerima.`);
    }
};