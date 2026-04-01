const { updatePlayerStats, getBalancedRoles, getLeaderboard } = require('../../lib/wwUtils'); 

module.exports = {
    name: "ww",
    alias: ["werewolf", "cekrole", "cektim", "wwstatus", "wwhelp"],
    description: "Main Werewolf Game",
    execute: async ({ ryzu, from, sender, args, command, reply, funcs }) => {
        try {
            if (!ryzu.werewolf) ryzu.werewolf = {};
            let room = ryzu.werewolf[from];

            let cmdArg = args.shift()
            let targetArg = args.join(" ");

            // Override cmdArg kalau user pakai alias
            if (command === "cekrole") cmdArg = "cekrole";
            if (command === "cektim" || command === "wwstatus") cmdArg = "cektim";
            if (command === "wwhelp") cmdArg = "info";

            // JIKA KOSONG
            if (!cmdArg || cmdArg === "") {
                return reply(`📖 *PERINTAH WEREWOLF*\n\n.ww join [nama] - Join game\n.ww start - Mulai game\n.ww cektim - Lihat pemain\n.ww cekrole - Cek role (PC)\n.ww info - Cara main\n.ww rules - Aturan main\n.ww lb - Leaderboard\n.ww kill [nama] - Bunuh (Werewolf)\n.ww protect [nama] - Lindungi (Guardian)\n.ww ramal [nama] - Ramal (Seer)\n.ww vote [nama] - Vote (Siang)\n.ww next - Lanjut phase\n.ww out - Keluar\n.ww reset - Reset`);
            }

            // === HELPER FUNCTION DALEM (Biar bisa akses reply/ryzu) ===
            const startPhaseTimer = (room, from, ryzu, reply) => {
                if (room.timer) clearTimeout(room.timer);
                room.phase = "day";
                reply(`☀️ *FASE SIANG DIMULAI (5 menit)*\nSilakan berdiskusi.`);

                room.timer = setTimeout(() => {
                    room.phase = "vote";
                    reply(`🗳️ *FASE VOTING DIMULAI (1 menit)*\nKetik .ww vote [nama] untuk memilih.`);

                    room.timer = setTimeout(() => {
                        // Logic Voting Sederhana
                        if (room.votes && Object.keys(room.votes).length > 0) {
                            let voteCount = {};
                            Object.values(room.votes).forEach(id => { voteCount[id] = (voteCount[id] || 0) + 1; });
                            let max = Math.max(...Object.values(voteCount));
                            let eliminatedId = Object.keys(voteCount).find(id => voteCount[id] === max);
                            let target = room.player.find(x => x.id === eliminatedId);
                            if (target) {
                                target.alive = false;
                                reply(`💀 *${target.nickname}* dieliminasi berdasarkan voting!`);
                            }
                            room.votes = {};
                        } else {
                            reply("❌ Tidak ada voting, tidak ada yang dieliminasi.");
                        }
                        
                        // Pindah Malam
                        room.phase = "night";
                        reply(`🌙 *FASE MALAM DIMULAI (1 menit)*\nWerewolf, Seer, dan Guardian silakan beraksi!`);
                        
                        room.timer = setTimeout(() => {
                            room.day++;
                            startPhaseTimer(room, from, ryzu, reply);
                        }, 60000); // Malam 1 menit

                    }, 60000); // Vote 1 menit
                }, 300000); // Siang 5 menit
            };

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

                case "rules":
                    return reply(`📖 *RULES WEREWOLF*\n\n1. Game min 4 orang.\n2. Siang hari (1 menit) digunakan untuk diskusi.\n3. Voting (1 menit) untuk mengeliminasi yang dicurigai.\n4. Malam hari (1 menit) untuk Werewolf membunuh, Seer meramal, dan Guardian melindungi.\n5. Jangan menyebarkan role di grup!`);

                case "cekrole":
                    if (!room || room.status !== "playing") return reply("❌ Tidak ada game WW yang sedang berlangsung.");
                    let p = room.player.find(x => x.id === sender);
                    if (!p) return reply("❌ Kamu bukan peserta game ini.");
                    return ryzu.sendMessage(sender, { 
                        text: `🎭 *INFORMASI ROLE KAMU*\n━━━━━━━━━━━━━━━━━\nRole: *${p.role}*\n${getRoleDescription(p.role)}\nStatus: ${p.alive ? "🟢 Hidup" : "🔴 Mati"}\n━━━━━━━━━━━━━━━━━\n\n_Jangan bagikan role ke orang lain!_` 
                    });

                case "cektim":
                    if (!room) return reply("❌ Tidak ada room Werewolf.");
                    let playerList = room.player.map((pl, i) => `${i + 1}. ${pl.nickname} (${pl.alive ? "🟢 Hidup" : "💀 Mati"})`).join("\n");
                    let gameStatus = room.status === "playing" 
                        ? `🎮 Sedang Berlangsung - Hari ke-${room.day}\n⏰ Phase: ${room.phase.toUpperCase()}` 
                        : (room.status === "finished" ? `✅ Game Selesai` : `❌ Menunggu dimulai`);
                    return reply(`📊 *STATUS GAME WEREWOLF*\n━━━━━━━━━━━━━━━━━\n${gameStatus}\n━━━━━━━━━━━━━━━━━\n\n👥 *PEMAIN (${room.player.length}/10):*\n${playerList}`);

                case "info":
                    return reply(`🎭 *DAFTAR ROLE WEREWOLF*\n━━━━━━━━━━━━━━━━━\n\n🐺 *WEREWOLF*\nBunuh 1 warga setiap malam\n\n👤 *VILLAGER*\nVoting untuk eliminate seseorang\n\n🔮 *SEER*\nRamal role pemain setiap malam\n\n🛡️ *GUARDIAN*\nLindungi 1 orang setiap malam\n\n🌾 *FARMER*\nBonus: Jika hidup di akhir, villager menang`);

                case "join":
                    if (room && room.status === "playing") return reply("❌ Game sudah dimulai.");
                    
                    if (!targetArg || targetArg.trim() === "") {
                        return reply("❌ Masukkan nama anda! Contoh: *.ww join Ryzu*");
                    }

                    if (!room) {
                        ryzu.werewolf[from] = { 
                            status: "waiting", 
                            player: [], 
                            day: 1, 
                            phase: "day", 
                            history: [], 
                            seerUsed: {}, 
                            guardianProtected: {}, 
                            votes: {} 
                        };
                        room = ryzu.werewolf[from];
                    }

                    if (room.player.find(x => x.id === sender)) return reply("❌ Kamu sudah join.");
                    if (room.player.length >= 10) return reply("❌ Sudah penuh.");
                    
                    let finalName = targetArg.trim();
                    
                    room.player.push({ id: sender, role: "", alive: true, nickname: finalName });
                    return reply(`✅ Berhasil join game dengan nama *${finalName}*!\n\n👥 Peserta: ${room.player.length}/10\n${room.player.map((pl, i) => `${i + 1}. ${pl.nickname}`).join("\n")}`);

                case "start":
                    if (!room || room.player.length < 4) return reply(`❌ Minimal 4 pemain.`);
                    if (room.status === "playing") return reply("❌ Game sudah jalan.");

                    room.status = "playing"; room.day = 1; room.phase = "day";
                    room.votes = {};

                    let roles = getBalancedRoles(room.player.length);
                    let shuffle = roles.sort(() => Math.random() - 0.5);
                    
                    room.player.forEach((pl, i) => {
                        pl.role = shuffle[i] || "VILLAGER"; 
                        pl.alive = true;
                        ryzu.sendMessage(pl.id, { text: `🎮 *GAME WEREWOLF DIMULAI!*\n\n🎭 Role Kamu: *${pl.role}*\n${getRoleDescription(pl.role)}` });
                    });

                    // Tambah Scenario
                    const scenarios = [
                        "🌕 Desa diserang werewolf misterius...",
                        "🌲 Malam gelap, suara lolongan terdengar...",
                        "🏚️ Warga mulai curiga satu sama lain..."
                    ];
                    room.scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

                    reply(`🎮 *GAME DIMULAI!*\n\n${room.scenario}\n\n🌅 FASE SIANG - HARI 1`);
                    
                    // Jalankan Timer Otomatis
                    startPhaseTimer(room, from, ryzu, reply);
                    break;

                case "kill":
                    if (!room || room.status !== "playing" || room.phase !== "night") return reply("❌ Belum saatnya.");
                    let wolf = room.player.find(x => x.id === sender);
                    if (!wolf || wolf.role !== "WEREWOLF" || !wolf.alive) return reply("❌ Kamu bukan werewolf hidup.");
                    let targetK = room.player.find(x => x.nickname.toLowerCase() === targetArg.toLowerCase());
                    if (!targetK || !targetK.alive) return reply("❌ Target tidak valid.");
                    if (room.guardianProtected[room.day] === targetK.id) return reply("🛡️ Target dilindungi Guardian!");
                    targetK.alive = false;
                    return reply(`✅ Werewolf memilih korban: ${targetK.nickname}`);

                case "protect":
                    if (!room || room.status !== "playing" || room.phase !== "night") return reply("❌ Belum saatnya.");
                    let guard = room.player.find(x => x.id === sender);
                    if (!guard || guard.role !== "GUARDIAN" || !guard.alive) return reply("❌ Kamu bukan guardian.");
                    let targetP = room.player.find(x => x.nickname.toLowerCase() === targetArg.toLowerCase());
                    if (!targetP || !targetP.alive) return reply("❌ Target tidak valid.");
                    room.guardianProtected[room.day] = targetP.id;
                    return reply(`✅ Guardian melindungi: ${targetP.nickname}`);

                case "ramal":
                    if (!room || room.status !== "playing" || room.phase !== "night") return reply("❌ Belum saatnya.");
                    let seer = room.player.find(x => x.id === sender);
                    if (!seer || seer.role !== "SEER" || !seer.alive) return reply("❌ Kamu bukan seer.");
                    if (room.seerUsed[room.day]) return reply("❌ Sudah ramal hari ini.");
                    let targetR = room.player.find(x => x.nickname.toLowerCase() === targetArg.toLowerCase());
                    if (!targetR) return reply("❌ Target tidak ditemukan.");
                    room.seerUsed[room.day] = true;
                    reply(`✅ Seer meramal: ${targetR.nickname}`);
                    return ryzu.sendMessage(sender, { text: `🔮 *HASIL RAMALAN*\n${getRoleEmoji(targetR.role)} ${targetR.nickname}: *${targetR.role}*` });

                case "vote":
                    if (!room || room.status !== "playing" || room.phase !== "vote") return reply("❌ Belum fase voting.");
                    let voter = room.player.find(x => x.id === sender);
                    if (!voter || !voter.alive) return reply("❌ Kamu tidak bisa vote.");
                    let targetV = room.player.find(x => x.nickname.toLowerCase() === targetArg.toLowerCase());
                    if (!targetV || !targetV.alive) return reply("❌ Target tidak valid.");
                    room.votes[sender] = targetV.id;
                    return reply(`✅ ${voter.nickname} mem-vote ${targetV.nickname}`);

                case "out":
                    if (room && room.status === "playing") return reply("❌ Jangan kabur!");
                    room.player = room.player.filter(x => x.id !== sender);
                    if (room.player.length === 0) delete ryzu.werewolf[from];
                    return reply("✅ Berhasil keluar.");

                case "reset":
                    if (room && room.timer) clearTimeout(room.timer);
                    delete ryzu.werewolf[from];
                    return reply("✅ Game direset.");

                default:
                    return reply(`🤔 Perintah tidak dikenali: ".ww ${cmdArg}"`);
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
        "WEREWOLF": "🐺 Bunuh warga di malam hari\n(Aksi: .ww kill [nama])",
        "VILLAGER": "👤 Cari werewolf dan vote saat siang\n(Aksi: .ww vote [nama])",
        "SEER": "🔮 Ramal role pemain tiap malam\n(Aksi: .ww ramal [nama])",
        "GUARDIAN": "🛡️ Lindungi warga tiap malam\n(Aksi: .ww protect [nama])",
        "FARMER": "🌾 Masih hidup di akhir = tim menang"
    };
    return descriptions[role] || "Peran tidak diketahui";
}

function getRoleEmoji(role) {
    const emojis = { "WEREWOLF": "🐺", "VILLAGER": "👤", "SEER": "🔮", "GUARDIAN": "🛡️", "FARMER": "🌾" };
    return emojis[role] || "❓";
}