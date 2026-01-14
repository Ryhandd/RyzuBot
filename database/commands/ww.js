<<<<<<< HEAD
module.exports = {
    name: "ww",
    alias: ["werewolf", "cekrole"],
    execute: async ({ ryzu, from, sender, args, command, reply, funcs }) => {
        if (!ryzu.werewolf) ryzu.werewolf = {};
        let room = ryzu.werewolf[from];

        // --- FITUR CEK ROLE ---
        if (command === "cekrole") {
            if (!room || room.status !== "playing") return reply("❌ Tidak ada game WW yang sedang berlangsung.");
            let p = room.player.find(x => x.id === sender);
            if (!p) return reply("❌ Kamu bukan peserta game ini.");
            return ryzu.sendMessage(sender, { text: `Your Role is: *${p.role.toUpperCase()}*` });
        }

        // --- LOGIKA GAME WW ---
        if (args[0] === "join") {
            if (room && room.status === "playing") return reply("❌ Game sudah dimulai.");
            if (!room) {
                ryzu.werewolf[from] = { status: "waiting", player: [] };
                room = ryzu.werewolf[from];
            }
            if (room.player.find(x => x.id === sender)) return reply("Kamu sudah join.");
            room.player.push({ id: sender, role: "" });
            return reply(`✅ Berhasil join. Peserta: ${room.player.length} orang.`);
        }

        if (args[0] === "start") {
            if (!room || room.player.length < 4) return reply("❌ Minimal 4 pemain untuk memulai.");
            if (room.status === "playing") return reply("Game sudah jalan.");

            room.status = "playing";
            let roles = ["WEREWOLF", "VILLAGER", "VILLAGER", "SEER"]; 
            if (room.player.length > 4) roles.push("GUARDIAN");

            let shuffle = roles.sort(() => Math.random() - 0.5);
            room.player.forEach((p, i) => {
                p.role = shuffle[i] || "VILLAGER";
                ryzu.sendMessage(p.id, { text: `🎮 Game Started!\nYour Role: *${p.role}*` });
            });

            return reply("🎮 Game Dimulai! Peran sudah dikirim ke Private Chat. Ketik *.cekrole* jika lupa.");
        }

        // --- LOGIKA WIN/HADIAH (Manual Trigger untuk demo/admin) ---
        // Kamu bisa memanggil ini saat voting selesai atau tim tertentu habis
        if (args[0] === "win") {
            if (!room || room.status !== "playing") return reply("Gada game jalan.");
            let winner = args[1]?.toLowerCase(); // werewolf atau villager
            
            if (!winner) return reply("Contoh: .ww win werewolf / .ww win villager");

            if (winner === "werewolf") {
                let prize = 50000;
                let xp = 1000;
                room.player.filter(p => p.role === "WEREWOLF").forEach(p => {
                    funcs.checkUser(p.id);
                    global.rpg[p.id].money += prize;
                    global.rpg[p.id].level += 1; // Bonus level up
                    ryzu.sendMessage(p.id, { text: `🔥 *TEAM WEREWOLF WIN!*\nKamu dapat +${prize.toLocaleString()} Money & +1 Level!` });
                });
                reply(`💀 *WEREWOLF MENANG!* 💀\nPara Werewolf berhasil memakan semua warga. Hadiah ${prize} Money telah dikirim.`);
            } else {
                let prize = 20000;
                room.player.filter(p => p.role !== "WEREWOLF").forEach(p => {
                    funcs.checkUser(p.id);
                    global.rpg[p.id].money += prize;
                    ryzu.sendMessage(p.id, { text: `🏆 *TEAM VILLAGER WIN!*\nKamu dapat +${prize.toLocaleString()} Money!` });
                });
                reply(`🎉 *VILLAGER MENANG!* 🎉\nWerewolf telah berhasil dibasmi. Masing-masing warga dapat ${prize} Money.`);
            }

            delete ryzu.werewolf[from]; // Reset Game
            return;
        }

        if (args[0] === "out") {
            if (!room) return reply("Gada room.");
            room.player = room.player.filter(x => x.id !== sender);
            if (room.player.length === 0) delete ryzu.werewolf[from];
            return reply("Berhasil keluar.");
        }
    }
=======
module.exports = {
    name: "ww",
    alias: ["werewolf", "cekrole"],
    execute: async ({ ryzu, from, sender, args, command, reply, funcs }) => {
        if (!ryzu.werewolf) ryzu.werewolf = {};
        let room = ryzu.werewolf[from];

        // --- FITUR CEK ROLE ---
        if (command === "cekrole") {
            if (!room || room.status !== "playing") return reply("❌ Tidak ada game WW yang sedang berlangsung.");
            let p = room.player.find(x => x.id === sender);
            if (!p) return reply("❌ Kamu bukan peserta game ini.");
            return ryzu.sendMessage(sender, { text: `Your Role is: *${p.role.toUpperCase()}*` });
        }

        // --- LOGIKA GAME WW ---
        if (args[0] === "join") {
            if (room && room.status === "playing") return reply("❌ Game sudah dimulai.");
            if (!room) {
                ryzu.werewolf[from] = { status: "waiting", player: [] };
                room = ryzu.werewolf[from];
            }
            if (room.player.find(x => x.id === sender)) return reply("Kamu sudah join.");
            room.player.push({ id: sender, role: "" });
            return reply(`✅ Berhasil join. Peserta: ${room.player.length} orang.`);
        }

        if (args[0] === "start") {
            if (!room || room.player.length < 4) return reply("❌ Minimal 4 pemain untuk memulai.");
            if (room.status === "playing") return reply("Game sudah jalan.");

            room.status = "playing";
            let roles = ["WEREWOLF", "VILLAGER", "VILLAGER", "SEER"]; 
            if (room.player.length > 4) roles.push("GUARDIAN");

            let shuffle = roles.sort(() => Math.random() - 0.5);
            room.player.forEach((p, i) => {
                p.role = shuffle[i] || "VILLAGER";
                ryzu.sendMessage(p.id, { text: `🎮 Game Started!\nYour Role: *${p.role}*` });
            });

            return reply("🎮 Game Dimulai! Peran sudah dikirim ke Private Chat. Ketik *.cekrole* jika lupa.");
        }

        // --- LOGIKA WIN/HADIAH (Manual Trigger untuk demo/admin) ---
        // Kamu bisa memanggil ini saat voting selesai atau tim tertentu habis
        if (args[0] === "win") {
            if (!room || room.status !== "playing") return reply("Gada game jalan.");
            let winner = args[1]?.toLowerCase(); // werewolf atau villager
            
            if (!winner) return reply("Contoh: .ww win werewolf / .ww win villager");

            if (winner === "werewolf") {
                let prize = 50000;
                let xp = 1000;
                room.player.filter(p => p.role === "WEREWOLF").forEach(p => {
                    funcs.checkUser(p.id);
                    global.rpg[p.id].money += prize;
                    global.rpg[p.id].level += 1; // Bonus level up
                    ryzu.sendMessage(p.id, { text: `🔥 *TEAM WEREWOLF WIN!*\nKamu dapat +${prize.toLocaleString()} Money & +1 Level!` });
                });
                reply(`💀 *WEREWOLF MENANG!* 💀\nPara Werewolf berhasil memakan semua warga. Hadiah ${prize} Money telah dikirim.`);
            } else {
                let prize = 20000;
                room.player.filter(p => p.role !== "WEREWOLF").forEach(p => {
                    funcs.checkUser(p.id);
                    global.rpg[p.id].money += prize;
                    ryzu.sendMessage(p.id, { text: `🏆 *TEAM VILLAGER WIN!*\nKamu dapat +${prize.toLocaleString()} Money!` });
                });
                reply(`🎉 *VILLAGER MENANG!* 🎉\nWerewolf telah berhasil dibasmi. Masing-masing warga dapat ${prize} Money.`);
            }

            delete ryzu.werewolf[from]; // Reset Game
            return;
        }

        if (args[0] === "out") {
            if (!room) return reply("Gada room.");
            room.player = room.player.filter(x => x.id !== sender);
            if (room.player.length === 0) delete ryzu.werewolf[from];
            return reply("Berhasil keluar.");
        }
    }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
};