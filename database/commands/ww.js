const { updatePlayerStats, getBalancedRoles, getLeaderboard } = require('../../lib/wwUtils'); 

module.exports = {
    name: "ww",
    alias: ["werewolf", "cekrole", "cektim", "wwstatus", "wwhelp"],
    description: "Main Werewolf Game",
    // PERHATIKAN: Kita pakai 'q' di sini, bukan 'args'
    execute: async ({ ryzu, from, sender, q, command, reply, funcs }) => {
        try {
            if (!ryzu.werewolf) ryzu.werewolf = {};
            let room = ryzu.werewolf[from];

            // PENGAMANAN ANTI NYASAR (Pakai 'q' bawaan RyzuBot)
            let cmdArg = "";
            let targetArg = "";

            if (q && q.trim() !== "") {
                let splitQ = q.trim().split(/ +/); // Pecah berdasarkan spasi
                cmdArg = splitQ.toLowerCase(); // Ambil kata pertama (join, start, dll)
                targetArg = splitQ.slice(1).join(" "); // Ambil sisa namanya (Ryzu)
            }

            // Override cmdArg kalau user pakai alias (misal: .cekrole)
            if (command === "cekrole") cmdArg = "cekrole";
            if (command === "cektim" || command === "wwstatus") cmdArg = "cektim";
            if (command === "wwhelp") cmdArg = "info";

            // JIKA KOSONG (Cuma ketik .ww), TAMPILKAN MENU
            if (!cmdArg || cmdArg === "") {
                return reply(`📖 *PERINTAH WEREWOLF*\n\n.ww join [nama] - Join game\n.ww start - Mulai game\n.ww cektim - Lihat pemain\n.ww cekrole - Cek role (PC)\n.ww info - Cara main\n.ww lb - Leaderboard\n.ww kill [nama] - Bunuh (Werewolf)\n.ww protect [nama] - Lindungi (Guardian)\n.ww ramal [nama] - Ramal (Seer)\n.ww vote [nama] - Vote (Siang)\n.ww next - Lanjut phase\n.ww out - Keluar\n.ww reset - Reset`);
            }

            // === MESIN UTAMA ===
            switch (cmdArg) {
                case "lb":
                case "leaderboard":
                    let lbType = targetArg || "total_wins";
                    let lb = getLeaderboard(lbType);
                    if (lb.length === 0) return reply("❌ Belum ada data leaderboard.");
                    let textLb = `🏆 *LEADERBOARD WEREWOLF*\n━━━━━━━━━━━━━━━━━\n`;
                    lb.forEach((p, i) => { 
                        textLb += `${i+1}. ${p.username}\n   Win: ${p.wins} | Games: ${p.games} | WR: ${p.winRate}%\n`; 
                    });
                    textLb += `━━━━━━━━━━━━━━━━━`;
                    return reply(textLb);

                case "cekrole":
                    if (!room || room.status !== "playing") return reply("❌ Tidak ada game WW yang sedang berlangsung.");
                    let p = room.player.find(x => x.id === sender);
                    if (!p) return reply("❌ Kamu bukan peserta game ini.");
                    return ryzu.sendMessage(sender, { 
                        text: `🎭 *INFORMASI ROLE KAMU*\n━━━━━━━━━━━━━━━━━\nRole: *${p.role}*\n${getRoleDescription(p.role)}\nStatus: ${p.alive ? "🟢 Hidup" : "🔴 Mati"}\n━━━━━━━━━━━━━━━━━\n\n_Jangan bagikan role ke orang lain!_` 
                    });

                case "cektim":
                    if (!room) return reply("❌ Tidak ada room Werewolf.");
                    let playerList = room.player.map((p, i) => `${i + 1}. ${p.nickname} (${p.alive ? "🟢 Hidup" : "💀 Mati"})`).join("\n");
                    let gameStatus = room.status === "playing" 
                        ? `🎮 Sedang Berlangsung - Hari ke-${room.day}\n⏰ Phase: ${room.phase === "day" ? "☀️ SIANG" : "🌙 MALAM"}` 
                        : (room.status === "finished" ? `✅ Game Selesai` : `❌ Menunggu dimulai`);
                    return reply(`📊 *STATUS GAME WEREWOLF*\n━━━━━━━━━━━━━━━━━\n${gameStatus}\n━━━━━━━━━━━━━━━━━\n\n👥 *PEMAIN (${room.player.length}/10):*\n${playerList}`);

                case "info":
                    return reply(`🎭 *DAFTAR ROLE WEREWOLF*\n━━━━━━━━━━━━━━━━━\n\n🐺 *WEREWOLF* (Penjahat)\nTugas: Bunuh 1 warga setiap malam\n\n👤 *VILLAGER* (Warga Biasa)\nKemampuan: Voting untuk eliminate seseorang\n\n🔮 *SEER* (Peramal)\nTugas: Ramal role pemain setiap malam (1x/hari)\n\n🛡️ *GUARDIAN* (Penjaga)\nTugas: Lindungi 1 orang setiap malam\n\n🌾 *FARMER* (Petani)\nBonus: Jika masih hidup di akhir, villager menang\n\n━━━━━━━━━━━━━━━━━\n💡 *CARA MAIN:*\n- Siang: Diskusi & voting eliminate\n- Malam: Role khusus beraksi`);

                case "join":
                    if (room && room.status === "playing") return reply("❌ Game sudah dimulai.");
                    if (!room) {
                        ryzu.werewolf[from] = { status: "waiting", player: [], day: 1, phase: "day", history: [], seerUsed: {}, guardianProtected: {} };
                        room = ryzu.werewolf[from];
                    }
                    if (room.player.find(x => x.id === sender)) return reply("❌ Kamu sudah join.");
                    if (room.player.length >= 10) return reply("❌ Sudah penuh (Max 10).");
                    
                    room.player.push({ id: sender, role: "", alive: true, nickname: targetArg || sender.split("@") });
                    return reply(`✅ Berhasil join game!\n\n👥 Peserta: ${room.player.length}/10\n${room.player.map((p, i) => `${i + 1}. ${p.nickname}`).join("\n")}\n\n_Leader: .ww start_`);

                case "start":
                    if (!room || room.player.length < 4) return reply(`❌ Minimal 4 pemain. Sekarang: ${room?.player.length || 0}`);
                    if (room.status === "playing") return reply("❌ Game sudah jalan.");

                    room.status = "playing"; room.day = 1; room.phase = "day";
                    room.history = []; room.seerUsed = {}; room.guardianProtected = {};

                    let roles = getBalancedRoles(room.player.length);
                    let shuffle = roles.sort(() => Math.random() - 0.5);
                    
                    room.player.forEach((p, i) => {
                        p.role = shuffle[i] || "VILLAGER"; 
                        p.alive = true;
                        ryzu.sendMessage(p.id, { text: `🎮 *GAME WEREWOLF DIMULAI!*\n\n🎭 Role Kamu: *${p.role}*\n${getRoleDescription(p.role)}` });
                    });
                    return reply(`🎮 *GAME DIMULAI!*\n\n🌅 FASE SIANG - HARI 1\n\n📋 Distribusi Role (Leader):\n${room.player.map(p => `${p.nickname}: ${p.role}`).join("\n")}\n\nℹ️ Gunakan: .ww kill, .ww protect, .ww ramal, .ww vote, .ww next, .ww cektim`);

                case "kill":
                    if (!room || room.status !== "playing") return reply("❌ Tidak ada game jalan.");
                    if (room.phase !== "night") return reply("❌ Hanya bisa malam hari!");
                    let wolf = room.player.find(x => x.id === sender);
                    if (!wolf || wolf.role !== "WEREWOLF" || !wolf.alive) return reply("❌ Kamu bukan werewolf hidup.");
                    let targetK = room.player.find(x => x.nickname.toLowerCase() === targetArg.toLowerCase() || x.id.includes(targetArg));
                    if (!targetK) return reply("❌ Target tidak ditemukan.");
                    if (targetK.id === sender) return reply("❌ Jangan bunuh diri.");
                    if (!targetK.alive) return reply("❌ Sudah mati.");
                    if (room.guardianProtected[room.day] === targetK.id) {
                        reply(`❌ Target dilindungi Guardian!`);
                        return ryzu.sendMessage(sender, { text: `🛡️ Gagal membunuh, target dilindungi!` });
                    }
                    targetK.alive = false;
                    room.history.push({ day: room.day, phase: "night", event: `Werewolf membunuh ${targetK.nickname}` });
                    return reply(`✅ Werewolf memilih korban: ${targetK.nickname}`);

                case "protect":
                    if (!room || room.status !== "playing") return reply("❌ Tidak ada game.");
                    if (room.phase !== "night") return reply("❌ Hanya malam hari!");
                    let guard = room.player.find(x => x.id === sender);
                    if (!guard || guard.role !== "GUARDIAN" || !guard.alive) return reply("❌ Kamu bukan guardian.");
                    let targetP = room.player.find(x => x.nickname.toLowerCase() === targetArg.toLowerCase() || x.id.includes(targetArg));
                    if (!targetP) return reply("❌ Target tidak ditemukan.");
                    if (!targetP.alive) return reply("❌ Sudah mati.");
                    if (room.guardianProtected[room.day - 1] === targetP.id) return reply("❌ Gak bisa lindungi orang yang sama 2x berturut-turut!");
                    room.guardianProtected[room.day] = targetP.id;
                    room.history.push({ day: room.day, phase: "night", event: `Guardian melindungi ${targetP.nickname}` });
                    return reply(`✅ Guardian melindungi: ${targetP.nickname}`);

                case "ramal":
                    if (!room || room.status !== "playing") return reply("❌ Tidak ada game.");
                    if (room.phase !== "night") return reply("❌ Hanya malam hari!");
                    let seer = room.player.find(x => x.id === sender);
                    if (!seer || seer.role !== "SEER" || !seer.alive) return reply("❌ Kamu bukan seer.");
                    if (room.seerUsed[room.day]) return reply("❌ Sudah ramal hari ini.");
                    let targetR = room.player.find(x => x.nickname.toLowerCase() === targetArg.toLowerCase() || x.id.includes(targetArg));
                    if (!targetR) return reply("❌ Target tidak ditemukan.");
                    if (targetR.id === sender) return reply("❌ Jangan ramal diri sendiri.");
                    room.seerUsed[room.day] = true;
                    reply(`✅ Seer meramal: ${targetR.nickname}`);
                    room.history.push({ day: room.day, phase: "night", event: `Seer meramal ${targetR.nickname}` });
                    return ryzu.sendMessage(sender, { text: `🔮 *HASIL RAMALAN*\n${getRoleEmoji(targetR.role)} ${targetR.nickname}: *${targetR.role}*` });

                case "vote":
                    if (!room || room.status !== "playing") return reply("❌ Tidak ada game.");
                    if (room.phase !== "day") return reply("❌ Hanya siang hari!");
                    let voter = room.player.find(x => x.id === sender);
                    if (!voter || !voter.alive) return reply("❌ Kamu mati/bukan peserta.");
                    let targetV = room.player.find(x => x.nickname.toLowerCase() === targetArg.toLowerCase() || x.id.includes(targetArg));
                    if (!targetV) return reply("❌ Target tidak ditemukan.");
                    if (!targetV.alive) return reply("❌ Sudah mati.");
                    if (!room.votes) room.votes = {};
                    room.votes[sender] = targetV.id;
                    return reply(`✅ ${voter.nickname} mem-vote ${targetV.nickname}`);

                case "next":
                    if (!room || room.status !== "playing") return reply("❌ Tidak ada game.");
                    if (room.phase === "day") {
                        if (room.votes && Object.keys(room.votes).length > 0) {
                            let voteCount = {};
                            Object.values(room.votes).forEach(votedId => { voteCount[votedId] = (voteCount[votedId] || 0) + 1; });
                            let maxVotes = Math.max(...Object.values(voteCount));
                            let eliminated = Object.keys(voteCount).find(id => voteCount[id] === maxVotes);
                            let target = room.player.find(x => x.id === eliminated);
                            if (target) {
                                target.alive = false;
                                reply(`🗳️ *HASIL VOTING*\n━━━━━━━━━━━━━━━━━\n💀 ${target.nickname} (${target.role}) dieliminasi!\n\n━━━━━━━━━━━━━━━━━\n🌙 Memasuki FASE MALAM...`);
                                room.history.push({ day: room.day, phase: "day", event: `${target.nickname} (${target.role}) dieliminasi voting` });
                            }
                        } else {
                            reply(`🗳️ *HASIL VOTING*\n━━━━━━━━━━━━━━━━━\nTidak ada yang voting hari ini!\n\n━━━━━━━━━━━━━━━━━\n🌙 Memasuki FASE MALAM...`);
                        }

                        room.phase = "night";
                        room.votes = {};
                        
                        room.player.forEach(p => {
                            if (p.role === "WEREWOLF" && p.alive) ryzu.sendMessage(p.id, { text: `🌙 FASE MALAM - HARI ${room.day}\n\nGunakan .ww kill [nama] untuk membunuh warga` });
                            if (p.role === "GUARDIAN" && p.alive) ryzu.sendMessage(p.id, { text: `🛡️ FASE MALAM - HARI ${room.day}\n\nGunakan .ww protect [nama] untuk melindungi` });
                            if (p.role === "SEER" && p.alive && !room.seerUsed[room.day]) ryzu.sendMessage(p.id, { text: `🔮 FASE MALAM - HARI ${room.day}\n\nGunakan .ww ramal [nama] untuk meramal role` });
                        });
                        return;

                    } else if (room.phase === "night") {
                        room.phase = "day";
                        room.day++;
                        room.votes = {};
                        room.seerUsed[room.day] = false;

                        let werewolvesAlive = room.player.filter(p => p.role === "WEREWOLF" && p.alive).length;
                        let villagersAlive = room.player.filter(p => p.role !== "WEREWOLF" && p.alive).length;
                        let farmerAlive = room.player.filter(p => p.role === "FARMER" && p.alive).length;

                        if (werewolvesAlive === 0) return finishGame(room, "villager", reply, ryzu, funcs);
                        if (werewolvesAlive >= villagersAlive) return finishGame(room, "werewolf", reply, ryzu, funcs);
                        if (farmerAlive > 0 && villagersAlive === farmerAlive) return finishGame(room, "villager", reply, ryzu, funcs);

                        return reply(`☀️ *FASE SIANG - HARI ${room.day}*\n━━━━━━━━━━━━━━━━━\nSilakan diskusi dan voting untuk eliminate seseorang.\n\nGunakan .ww vote [nama]`);
                    }
                    return;

                case "out":
                    if (!room) return reply("❌ Tidak ada room.");
                    if (room.status === "playing") return reply("❌ Tidak bisa keluar saat game berlangsung.");
                    room.player = room.player.filter(x => x.id !== sender);
                    if (room.player.length === 0) delete ryzu.werewolf[from];
                    return reply("✅ Berhasil keluar dari game.");

                case "reset":
                    delete ryzu.werewolf[from];
                    return reply("✅ Game direset.");

                default:
                    return reply(`🤔 Perintah tidak dikenali: ".ww ${cmdArg}"\nKetik .ww untuk melihat panduan.`);
            }
            
        } catch (error) {
            console.error("[ERROR WW]:", error);
            reply(`❌ Terjadi kesalahan: ${error.message}`);
        }
    }
};

// Helper Functions
function getRoleDescription(role) {
    const descriptions = {
        "WEREWOLF": "🐺 Penjahat yang membunuh warga di malam hari\n(Aksi: .ww kill [nama])",
        "VILLAGER": "👤 Warga biasa yang harus menemukan werewolf\n(Aksi: .ww vote [nama] saat siang)",
        "SEER": "🔮 Peramal yang bisa mengetahui role pemain (1x sehari)\n(Aksi: .ww ramal [nama] di malam hari)",
        "GUARDIAN": "🛡️ Penjaga yang melindungi warga dari werewolf\n(Aksi: .ww protect [nama] di malam hari)",
        "FARMER": "🌾 Petani yang bisa membuat tim villager menang otomatis\nJika masih hidup sampai hari terakhir"
    };
    return descriptions[role] || "Peran tidak diketahui";
}

function getRoleEmoji(role) {
    const emojis = { "WEREWOLF": "🐺", "VILLAGER": "👤", "SEER": "🔮", "GUARDIAN": "🛡️", "FARMER": "🌾" };
    return emojis[role] || "❓";
}

function finishGame(room, winner, reply, ryzu, funcs) {
    room.status = "finished";

    if (winner === "werewolf") {
        let prize = 50000;
        room.player.filter(p => p.role === "WEREWOLF").forEach(p => {
            updatePlayerStats(p.id, "WEREWOLF", prize, funcs);
            if (global.rpg[p.id]) global.rpg[p.id].level = (global.rpg[p.id].level || 1) + 1;
            ryzu.sendMessage(p.id, { text: `🔥 *TEAM WEREWOLF MENANG!*\n━━━━━━━━━━━━━━━━━\n💀 Semua warga berhasil dibasmi!\n\n💰 Hadiah: +${prize.toLocaleString()} Money\n⭐ Bonus: +1 Level` });
        });
        reply(`💀 *WEREWOLF MENANG!* 💀\n\n🔥 Para werewolf berhasil memakan semua warga!\nMasing-masing werewolf dapat ${prize.toLocaleString()} Money & +1 Level!`);
    } else {
        let prize = 20000;
        room.player.filter(p => p.role !== "WEREWOLF").forEach(p => {
            if (p.alive) {
                updatePlayerStats(p.id, p.role, prize, funcs);
                ryzu.sendMessage(p.id, { text: `🏆 *TEAM VILLAGER MENANG!*\n━━━━━━━━━━━━━━━━━\n✅ Werewolf telah dibasmi!\n\n💰 Hadiah: +${prize.toLocaleString()} Money` });
            }
        });
        reply(`🎉 *VILLAGER MENANG!* 🎉\n\n✅ Werewolf telah berhasil dibasmi!\nMasing-masing villager yang selamat dapat ${prize.toLocaleString()} Money!`);
    }

    delete room.werewolf;
}