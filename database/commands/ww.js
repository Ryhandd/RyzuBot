module.exports = {
    name: "ww",
    alias: ["werewolf", "cekrole", "cektim", "wwstatus", "wwhelp"],
    execute: async ({ ryzu, from, sender, args, command, reply, funcs }) => {
        if (!ryzu.werewolf) ryzu.werewolf = {};
        let room = ryzu.werewolf[from];

        // --- FITUR CEK ROLE ---
        if (command === "cekrole") {
            if (!room || room.status !== "playing") return reply("❌ Tidak ada game WW yang sedang berlangsung.");
            let p = room.player.find(x => x.id === sender);
            if (!p) return reply("❌ Kamu bukan peserta game ini.");
            
            let roleDesc = getRoleDescription(p.role);
            return ryzu.sendMessage(sender, { 
                text: `🎭 *INFORMASI ROLE KAMU*\n━━━━━━━━━━━━━━━━━\nRole: *${p.role}*\n${roleDesc}\nStatus: ${p.alive ? "🟢 Hidup" : "🔴 Mati"}\n━━━━━━━━━━━━━━━━━\n\n_Jangan bagikan role ke orang lain!_` 
            });
        }

        // --- FITUR CEK ANGGOTA & STATUS GAME ---
        if (command === "cektim" || command === "wwstatus") {
            if (!room) return reply("❌ Tidak ada room Werewolf.");
            
            let playerList = room.player.map((p, i) => {
                let status = p.alive ? "🟢 Hidup" : "💀 Mati";
                return `${i + 1}. ${p.nickname || p.id.split("@")[0]} (${status})`;
            }).join("\n");

            let gameStatus = `❌ Menunggu dimulai`;
            if (room.status === "playing") {
                gameStatus = `🎮 Sedang Berlangsung - Hari ke-${room.day}\n⏰ Phase: ${room.phase === "day" ? "☀️ SIANG" : "🌙 MALAM"}`;
            } else if (room.status === "finished") {
                gameStatus = `✅ Game Selesai`;
            }

            let text = `📊 *STATUS GAME WEREWOLF*\n━━━━━━━━━━━━━━━━━\n${gameStatus}\n━━━━━━━━━━━━━━━━━\n\n👥 *PEMAIN (${room.player.length}/10):*\n${playerList}\n\n_Ketik .ww info untuk deskripsi role_`;
            return reply(text);
        }

        // --- FITUR INFO ROLES ---
        if (command === "wwhelp" || args[0] === "info") {
            let text = `🎭 *DAFTAR ROLE WEREWOLF*\n━━━━━━━━━━━━━━━━━\n\n🐺 *WEREWOLF* (Penjahat)\nTugas: Bunuh 1 warga setiap malam\nTaktik: Diskusi siang untuk keluar dari curigaan\n\n👤 *VILLAGER* (Warga Biasa)\nTugas: Temukan werewolf saat siang hari\nKemampuan: Voting untuk eliminate seseorang\n\n🔮 *SEER* (Peramal)\nTugas: Ramal role pemain setiap malam\nHanya bisa ramal 1x per hari\nJangan ketahuan sebagai Seer!\n\n🛡️ *GUARDIAN* (Penjaga)\nTugas: Lindungi 1 orang setiap malam\nJika dilindungi, werewolf tidak bisa membunuh\nTidak bisa lindungi orang yang sama 2x berturut-turut\n\n🌾 *FARMER* (Petani)\nTugas: Bertahan hidup & voting\nBonus: Jika masih hidup di hari terakhir, team villager menang otomatis\n\n━━━━━━━━━━━━━━━━━\n💡 *CARA MAIN:*\n- Siang: Diskusi & voting untuk eliminate seseorang\n- Malam: Role khusus melakukan aksi mereka\n- Tim Werewolf menang jika = jumlah villager\n- Tim Villager menang jika semua werewolf dead`;
            return reply(text);
        }

        // --- LOGIKA GAME WW ---
        if (args[0] === "join") {
            if (room && room.status === "playing") return reply("❌ Game sudah dimulai, tunggu game selesai.");
            if (!room) {
                ryzu.werewolf[from] = { 
                    status: "waiting", 
                    player: [],
                    day: 1,
                    phase: "day",
                    history: [],
                    seerUsed: {}
                };
                room = ryzu.werewolf[from];
            }
            if (room.player.find(x => x.id === sender)) return reply("❌ Kamu sudah join game ini.");
            if (room.player.length >= 10) return reply("❌ Sudah penuh (Max 10 pemain)");
            
            room.player.push({ 
                id: sender, 
                role: "",
                alive: true,
                nickname: args[1] || sender.split("@")[0]
            });
            
            let text = `✅ Berhasil join game!\n\n👥 Peserta sekarang: ${room.player.length}/10\n\n${room.player.map((p, i) => `${i + 1}. ${p.nickname}`).join("\n")}\n\n_Leader: gunakan .ww start untuk memulai game_`;
            return reply(text);
        }

        if (args[0] === "start") {
            if (!room || room.player.length < 4) return reply("❌ Minimal 4 pemain untuk memulai. Sekarang: " + (room?.player.length || 0));
            if (room.status === "playing") return reply("❌ Game sudah jalan.");

            room.status = "playing";
            room.day = 1;
            room.phase = "day";
            room.history = [];
            room.seerUsed = {};
            room.guardianProtected = {};

            // Role Distribution
            let roles = [];
            let playerCount = room.player.length;

            if (playerCount >= 4) roles.push("WEREWOLF");
            if (playerCount >= 5) roles.push("SEER");
            if (playerCount >= 6) roles.push("GUARDIAN");
            if (playerCount >= 7) roles.push("FARMER");
            if (playerCount >= 8) roles.push("WEREWOLF");
            
            // Fill the rest with VILLAGER
            while (roles.length < playerCount) {
                roles.push("VILLAGER");
            }

            let shuffle = roles.sort(() => Math.random() - 0.5);
            room.player.forEach((p, i) => {
                p.role = shuffle[i] || "VILLAGER";
                p.alive = true;
                
                let roleDesc = getRoleDescription(p.role);
                ryzu.sendMessage(p.id, { 
                    text: `🎮 *GAME WEREWOLF DIMULAI!*\n━━━━━━━━━━━━━━━━━\n\n🎭 Role Kamu: *${p.role}*\n${roleDesc}\n\n━━━━━━━━━━━━━━━━━\nℹ️ Cek group untuk info lebih lanjut!\n_Jangan bagikan role mu!_` 
                });
            });

            let roleList = room.player.map(p => `${p.nickname}: ${p.role}`).join("\n");
            reply(`🎮 *GAME DIMULAI!*\n\n🌅 FASE SIANG - HARI 1\n\n📋 Distribusi Role (Leader only):\n${roleList}\n\n━━━━━━━━━━━━━━━━━\nℹ️ Gunakan perintah:\n.ww kill @user (Werewolf malam)\n.ww protect @user (Guardian malam)\n.ww ramal @user (Seer malam)\n.ww vote @user (Voting siang)\n.ww next (Lanjut ke fase berikutnya)\n.ww cektim (Cek status pemain)`);
        }

        // --- FITUR KILL (Werewolf) ---
        if (args[0] === "kill") {
            if (!room || room.status !== "playing") return reply("❌ Tidak ada game jalan.");
            if (room.phase !== "night") return reply("❌ Hanya bisa kill di malam hari!");

            let player = room.player.find(x => x.id === sender);
            if (!player || player.role !== "WEREWOLF" || !player.alive) {
                return reply("❌ Kamu bukan werewolf yang hidup.");
            }

            let target = room.player.find(x => x.nickname === args[1] || x.id.includes(args[1]));
            if (!target) return reply("❌ Target tidak ditemukan. Cek .ww cektim");
            if (target.id === sender) return reply("❌ Tidak bisa bunuh diri sendiri.");
            if (!target.alive) return reply("❌ Target sudah mati.");

            // Check Guardian Protection
            if (room.guardianProtected[room.day] === target.id) {
                reply(`❌ Target dilindungi Guardian! Bunuh gagal.`);
                return ryzu.sendMessage(sender, { text: `🛡️ Korban pilihan mu dilindungi Guardian!` });
            }

            target.alive = false;
            reply(`✅ Werewolf memilih korban: ${target.nickname}\n💀 ${target.nickname} akan dieksekusi saat fajar tiba.`);
            
            room.history.push({
                day: room.day,
                phase: "night",
                event: `Werewolf membunuh ${target.nickname}`
            });
        }

        // --- FITUR PROTECT (Guardian) ---
        if (args[0] === "protect") {
            if (!room || room.status !== "playing") return reply("❌ Tidak ada game jalan.");
            if (room.phase !== "night") return reply("❌ Hanya bisa protect di malam hari!");

            let player = room.player.find(x => x.id === sender);
            if (!player || player.role !== "GUARDIAN" || !player.alive) {
                return reply("❌ Kamu bukan guardian yang hidup.");
            }

            let target = room.player.find(x => x.nickname === args[1] || x.id.includes(args[1]));
            if (!target) return reply("❌ Target tidak ditemukan.");
            if (!target.alive) return reply("❌ Target sudah mati.");

            // Check if protecting same target twice
            if (room.guardianProtected[room.day - 1] === target.id) {
                return reply("❌ Tidak bisa lindungi orang yang sama 2x berturut-turut!");
            }

            room.guardianProtected[room.day] = target.id;
            reply(`✅ Guardian melindungi: ${target.nickname}`);
            
            room.history.push({
                day: room.day,
                phase: "night",
                event: `Guardian melindungi ${target.nickname}`
            });
        }

        // --- FITUR RAMAL (Seer) ---
        if (args[0] === "ramal") {
            if (!room || room.status !== "playing") return reply("❌ Tidak ada game jalan.");
            if (room.phase !== "night") return reply("❌ Hanya bisa ramal di malam hari!");

            let player = room.player.find(x => x.id === sender);
            if (!player || player.role !== "SEER" || !player.alive) {
                return reply("❌ Kamu bukan seer yang hidup.");
            }

            if (room.seerUsed[room.day]) {
                return reply("❌ Kamu sudah ramal hari ini! Ramal lagi besok.");
            }

            let target = room.player.find(x => x.nickname === args[1] || x.id.includes(args[1]));
            if (!target) return reply("❌ Target tidak ditemukan.");
            if (target.id === sender) return reply("❌ Tidak bisa ramal diri sendiri.");

            room.seerUsed[room.day] = true;
            let roleEmoji = getRoleEmoji(target.role);
            
            reply(`✅ Seer meramal: ${target.nickname}`);
            ryzu.sendMessage(sender, { 
                text: `🔮 *HASIL RAMALAN HARI ${room.day}*\n━━━━━━━━━━━━━━━━━\n${roleEmoji} ${target.nickname} adalah: *${target.role}*\n━━━━━━━━━━━━━━━━━` 
            });

            room.history.push({
                day: room.day,
                phase: "night",
                event: `Seer meramal ${target.nickname} sebagai ${target.role}`
            });
        }

        // --- FITUR VOTING (Siang) ---
        if (args[0] === "vote") {
            if (!room || room.status !== "playing") return reply("❌ Tidak ada game jalan.");
            if (room.phase !== "day") return reply("❌ Hanya bisa vote di siang hari!");

            let player = room.player.find(x => x.id === sender);
            if (!player || !player.alive) return reply("❌ Kamu sudah mati atau bukan peserta.");

            let target = room.player.find(x => x.nickname === args[1] || x.id.includes(args[1]));
            if (!target) return reply("❌ Target tidak ditemukan.");
            if (!target.alive) return reply("❌ Target sudah mati.");

            if (!room.votes) room.votes = {};
            room.votes[sender] = target.id;

            reply(`✅ ${player.nickname} memilih ${target.nickname} untuk dieliminasi.`);
        }

        // --- FITUR NEXT PHASE ---
        if (args[0] === "next") {
            if (!room || room.status !== "playing") return reply("❌ Tidak ada game jalan.");

            if (room.phase === "day") {
                // Hitung voting
                if (room.votes && Object.keys(room.votes).length > 0) {
                    let voteCount = {};
                    Object.values(room.votes).forEach(votedId => {
                        voteCount[votedId] = (voteCount[votedId] || 0) + 1;
                    });

                    let maxVotes = Math.max(...Object.values(voteCount));
                    let eliminated = Object.keys(voteCount).find(id => voteCount[id] === maxVotes);
                    
                    let target = room.player.find(x => x.id === eliminated);
                    if (target) {
                        target.alive = false;
                        reply(`🗳️ *HASIL VOTING*\n━━━━━━━━━━━━━━━━━\n💀 ${target.nickname} (${target.role}) dieliminasi!\n\n━━━━━━━━━━━━━━━━━\n🌙 Memasuki FASE MALAM...`);
                        
                        room.history.push({
                            day: room.day,
                            phase: "day",
                            event: `${target.nickname} (${target.role}) dieliminasi voting`
                        });
                    }
                }

                room.phase = "night";
                room.votes = {};
                
                // Notify players
                room.player.forEach(p => {
                    if (p.role === "WEREWOLF" && p.alive) {
                        ryzu.sendMessage(p.id, { text: `🌙 FASE MALAM - HARI ${room.day}\n\nGunakan .ww kill @user untuk membunuh warga` });
                    }
                    if (p.role === "GUARDIAN" && p.alive) {
                        ryzu.sendMessage(p.id, { text: `🛡️ FASE MALAM - HARI ${room.day}\n\nGunakan .ww protect @user untuk melindungi` });
                    }
                    if (p.role === "SEER" && p.alive) {
                        if (!room.seerUsed[room.day]) {
                            ryzu.sendMessage(p.id, { text: `🔮 FASE MALAM - HARI ${room.day}\n\nGunakan .ww ramal @user untuk meramal role` });
                        }
                    }
                });

            } else if (room.phase === "night") {
                room.phase = "day";
                room.day++;
                
                // Reset actions
                room.votes = {};
                room.seerUsed[room.day] = false;

                // Check win conditions
                let werewolvesAlive = room.player.filter(p => p.role === "WEREWOLF" && p.alive).length;
                let villagersAlive = room.player.filter(p => p.role !== "WEREWOLF" && p.alive).length;
                let farmerAlive = room.player.filter(p => p.role === "FARMER" && p.alive).length;

                if (werewolvesAlive === 0) {
                    return finishGame(room, "villager", reply, ryzu, funcs);
                }
                if (werewolvesAlive >= villagersAlive) {
                    return finishGame(room, "werewolf", reply, ryzu, funcs);
                }
                if (farmerAlive > 0 && villagersAlive === farmerAlive) {
                    return finishGame(room, "villager", reply, ryzu, funcs);
                }

                reply(`☀️ *FASE SIANG - HARI ${room.day}*\n━━━━━━━━━━━━━━━━━\nSilakan diskusi dan voting untuk eliminate seseorang.\n\nGunakan .ww vote @user`);
            }
        }

        // --- FITUR OUT ---
        if (args[0] === "out") {
            if (!room) return reply("❌ Tidak ada room.");
            if (room.status === "playing") return reply("❌ Tidak bisa keluar saat game berlangsung.");
            
            room.player = room.player.filter(x => x.id !== sender);
            if (room.player.length === 0) delete ryzu.werewolf[from];
            return reply("✅ Berhasil keluar dari game.");
        }

        // --- FITUR RESET ---
        if (args[0] === "reset") {
            delete ryzu.werewolf[from];
            return reply("✅ Game direset.");
        }

        if (!args[0]) {
            return reply(`📖 *PERINTAH WEREWOLF*\n\n.ww join [nama] - Join game\n.ww start - Mulai game (min 4 pemain)\n.ww cektim - Lihat status pemain\n.ww cekrole - Cek role kamu (Private Chat)\n.ww info - Daftar role & cara main\n.ww kill @user - Bunuh (Werewolf malam)\n.ww protect @user - Lindungi (Guardian malam)\n.ww ramal @user - Ramal (Seer malam)\n.ww vote @user - Vote eliminate (Siang)\n.ww next - Lanjut phase\n.ww out - Keluar game\n.ww reset - Reset game`);
        }
    }
};

// Helper Functions
function getRoleDescription(role) {
    const descriptions = {
        "WEREWOLF": "🐺 Penjahat yang membunuh warga di malam hari\n(Aksi: .ww kill @user)",
        "VILLAGER": "👤 Warga biasa yang harus menemukan werewolf\n(Aksi: .ww vote @user saat siang)",
        "SEER": "🔮 Peramal yang bisa mengetahui role pemain (1x sehari)\n(Aksi: .ww ramal @user di malam hari)",
        "GUARDIAN": "🛡️ Penjaga yang melindungi warga dari werewolf\n(Aksi: .ww protect @user di malam hari)",
        "FARMER": "🌾 Petani yang bisa membuat tim villager menang otomatis\nJika masih hidup sampai hari terakhir"
    };
    return descriptions[role] || "Peran tidak diketahui";
}

function getRoleEmoji(role) {
    const emojis = {
        "WEREWOLF": "🐺",
        "VILLAGER": "👤",
        "SEER": "🔮",
        "GUARDIAN": "🛡️",
        "FARMER": "🌾"
    };
    return emojis[role] || "❓";
}

function finishGame(room, winner, reply, ryzu, funcs) {
    room.status = "finished";

    if (winner === "werewolf") {
        let prize = 50000;
        let xp = 1000;
        room.player.filter(p => p.role === "WEREWOLF").forEach(p => {
            funcs.checkUser(p.id);
            if (global.rpg[p.id]) {
                global.rpg[p.id].money = (global.rpg[p.id].money || 0) + prize;
                global.rpg[p.id].level = (global.rpg[p.id].level || 1) + 1;
            }
            ryzu.sendMessage(p.id, { text: `🔥 *TEAM WEREWOLF MENANG!*\n━━━━━━━━━━━━━━━━━\n💀 Semua warga berhasil dibasmi!\n\n💰 Hadiah: +${prize.toLocaleString()} Money\n⭐ Bonus: +1 Level` });
        });
        reply(`💀 *WEREWOLF MENANG!* 💀\n\n🔥 Para werewolf berhasil memakan semua warga!\nMasing-masing werewolf dapat ${prize.toLocaleString()} Money & +1 Level!`);
    } else {
        let prize = 20000;
        room.player.filter(p => p.role !== "WEREWOLF").forEach(p => {
            if (p.alive) {
                funcs.checkUser(p.id);
                if (global.rpg[p.id]) {
                    global.rpg[p.id].money = (global.rpg[p.id].money || 0) + prize;
                }
                ryzu.sendMessage(p.id, { text: `🏆 *TEAM VILLAGER MENANG!*\n━━━━━━━━━━━━━━━━━\n✅ Werewolf telah dibasmi!\n\n💰 Hadiah: +${prize.toLocaleString()} Money` });
            }
        });
        reply(`🎉 *VILLAGER MENANG!* 🎉\n\n✅ Werewolf telah berhasil dibasmi!\nMasing-masing villager dapat ${prize.toLocaleString()} Money!`);
    }

    delete room.werewolf;
}