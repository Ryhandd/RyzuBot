module.exports = {
    name: "top",
    alias: ["top", "leaderboard", "lb", "rank"],
    execute: async ({ reply, args, sender, ryzu, from, prefix, msg }) => {
        
        try {
            // --- DAFTAR KATEGORI LENGKAP ---
            const categories = {
                // Statistik Dasar
                money: "Money 💰",
                level: "Level 📊",
                exp: "Experience ✨",
                // Hasil Tambang (Mining)
                diamond: "Diamond 💎",
                emas: "Emas 🥇",
                besi: "Besi ⛓️",
                batu: "Batu 🪨",
                kayu: "Kayu 🪵",
                // Hasil Mancing (Fishing)
                ikan: "Ikan Biasa 🐟",
                ikan_mas: "Ikan Mas 🐠",
                ikan_lele: "Ikan Lele 🐟",
                ikan_paus: "Ikan Paus 🐳",
                kepiting: "Kepiting 🦀",
                // Lootbox
                common: "Common Box 📦",
                uncommon: "Uncommon Box 🟢",
                mythic: "Mythic Box 🟣",
                legendary: "Legendary Box 👑",
                // Investasi
                bank: "Investasi 🏦"
            };

            let type = args[0] ? args[0].toLowerCase() : "";

            // Jika kosong atau salah ketik, tampilkan menu bantuan
            if (!type || !categories[type]) {
                let txt = `🏆 *LEADERBOARD RYZU*\n`;
                txt += `Contoh: ${prefix}top money\n\n`;
                txt += `*PILIHAN KATEGORI:*\n`;
                
                // Menyusun tampilan kategori agar rapi (2 kolom)
                let keys = Object.keys(categories);
                for (let i = 0; i < keys.length; i++) {
                    txt += `• ${keys[i]}${i % 2 === 0 ? "       " : "\n"}`;
                }
                return reply(txt.trim());
            }

            // 1. Ambil data dari global.rpg
            let allUsers = Object.entries(global.rpg); 

            // 2. Logika Sorting (Pengurutan)
            if (type === 'bank') {
                allUsers.sort((a, b) => {
                    let bankA = a[1].investasi ? a[1].investasi.reduce((acc, curr) => acc + curr.return, 0) : 0;
                    let bankB = b[1].investasi ? b[1].investasi.reduce((acc, curr) => acc + curr.return, 0) : 0;
                    return bankB - bankA;
                });
            } else {
                allUsers.sort((a, b) => (b[1][type] || 0) - (a[1][type] || 0));
            }

            // 3. Ambil Top 10 Teratas
            let top10 = allUsers.slice(0, 10);
            
            // 4. Hitung Statistik Pengirim (User Sendiri)
            let myRank = allUsers.findIndex(u => u[0] === sender) + 1;
            let myValue = global.rpg[sender][type] || 0;
            if (type === 'bank') {
                myValue = global.rpg[sender].investasi ? global.rpg[sender].investasi.reduce((acc, curr) => acc + curr.return, 0) : 0;
            }

            // 5. Susun Pesan Leaderboard
            let text = `🏆 *TOP 10 ${categories[type].toUpperCase()}*\n\n`;
            let mentions = [];

            top10.forEach((u, index) => {
                let id = u[0];
                let val = u[1][type] || 0;
                
                if (type === 'bank') {
                    val = u[1].investasi ? u[1].investasi.reduce((acc, curr) => acc + curr.return, 0) : 0;
                }

                let medal = `${index + 1}.`;
                if (index === 0) medal = "🥇";
                if (index === 1) medal = "🥈";
                if (index === 2) medal = "🥉";

                text += `${medal} @${id.split('@')[0]}\n`;
                text += `   └ ${val.toLocaleString()} ${type === 'level' ? 'Lv' : ''}\n`;
                mentions.push(id);
            });

            text += `\n────────────────\n`;
            text += `👤 *Posisi Kamu:* #${myRank} (${myValue.toLocaleString()})`;

            // 6. Kirim Pesan
            await ryzu.sendMessage(from, { text: text, mentions: mentions }, { quoted: msg });

        } catch (e) {
            console.log("Error TOP:", e);
            reply("❌ Gagal memuat leaderboard. Pastikan kategorinya benar.");
        }
    }
};