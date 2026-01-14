module.exports = {
    name: "lotre",
    alias: ["belilotre", "tiket"],
    execute: async ({ ryzu, from, sender, reply, funcs, msg, args, isCreator }) => {
        // 1. Pastikan user terdaftar
        funcs.checkUser(sender);
        const user = global.rpg[sender];
        const hargaTiket = 100000;

        // 2. Inisialisasi data lotre di global.rpg (Bukan global.db)
        if (!global.rpg.lotre_system) {
            global.rpg.lotre_system = {
                peserta: [],
                status: "open"
            };
        }

        const lotre = global.rpg.lotre_system;

        // --- FITUR INFO ---
        if (args[0] === "info" || !args[0]) {
            let list = lotre.peserta.length > 0 ? 
                lotre.peserta.map((v, i) => `${i + 1}. @${v.split('@')[0]}`).join('\n') : 
                "Belum ada peserta.";
            
            let txt = `🎟️ *RYZU MINGGUAN LOTRE* 🎟️\n\n`;
            txt += `💰 *Harga Tiket:* 100.000 Money\n`;
            txt += `🎁 *Hadiah Utama:* \n`;
            txt += `   - 💵 500.000 Money\n`;
            txt += `   - 📦 10 Mythic Box\n`;
            txt += `   - 📦 5 Legendary Box\n\n`;
            txt += `👥 *Peserta Saat Ini:* (${lotre.peserta.length})\n${list}\n\n`;
            txt += `Ketik *.lotre beli* untuk ikut serta!`;

            return ryzu.sendMessage(from, { 
                text: txt, 
                mentions: lotre.peserta 
            }, { quoted: msg });
        }

        // --- FITUR BELI ---
        if (args[0] === "beli") {
            if (user.money < hargaTiket) return reply("❌ Uang kamu gak cukup, Bro. Butuh 100.000 buat beli tiket!");
            
            user.money -= hargaTiket;
            lotre.peserta.push(sender);
            funcs.saveRPG(); // Simpan ke userRPG.json

            let txt = `✅ *BERHASIL MEMBELI TIKET LOTRE*\n\n`;
            txt += `Nama: @${sender.split('@')[0]}\n`;
            txt += `Jumlah Tiket Kamu: ${lotre.peserta.filter(v => v === sender).length}\n`;
            txt += `\nSemoga beruntung saat pengundian!`;

            return ryzu.sendMessage(from, { 
                text: txt, 
                mentions: [sender] 
            }, { quoted: msg });
        }

        // --- FITUR ROLL (Hanya Owner) ---
        if (args[0] === "roll" || args[0] === "undi") {
            if (!isCreator) return reply("❌ Hanya Owner yang bisa mengundi!");
            if (lotre.peserta.length < 2) return reply("❌ Peserta minimal harus 2 orang baru bisa di-roll!");

            reply("🎲 *Mengocok nama pemenang...*");
            
            setTimeout(async () => {
                const pemenang = lotre.peserta[Math.floor(Math.random() * lotre.peserta.length)];
                
                // Pastikan pemenang ada di database
                funcs.checkUser(pemenang);
                const uWin = global.rpg[pemenang];

                // Kasih hadiah
                uWin.money += 500000;
                uWin.mythic = (uWin.mythic || 0) + 10;
                uWin.legendary = (uWin.legendary || 0) + 5;
                
                let winTxt = `🎊 *PEMENANG LOTRE RYZU* 🎊\n\n`;
                winTxt += `Selamat kepada: @${pemenang.split('@')[0]}\n\n`;
                winTxt += `🎁 *Hadiah Telah Dikirim:* \n`;
                winTxt += `- 💵 500.000 Money\n`;
                winTxt += `- 📦 10 Mythic Box\n`;
                winTxt += `- 📦 5 Legendary Box\n\n`;
                winTxt += `Cek *.inv* untuk melihat hadiahmu!`;

                // Reset Peserta
                lotre.peserta = [];
                funcs.saveRPG();

                await ryzu.sendMessage(from, { 
                    text: winTxt, 
                    contextInfo: { 
                        mentionedJid: [pemenang],
                        externalAdReply: {
                            title: "LOTRE WINNER!",
                            body: "Selamat atas kemenanganmu!",
                            thumbnailUrl: "https://files.catbox.moe/cz6tt0.jpg", // Pakai foto menu tadi
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: msg });
            }, 3000);
        }
    }
};