const { updatePlayerStats, getBalancedRoles, getLeaderboard } = require('../../lib/wwUtils');

// --- CONFIGURATION ---
const PHASE_TIME = {
    day: 300000,   // 5 menit
    vote: 60000,   // 1 menit
    night: 60000   // 1 menit
};

const SCENARIOS = [
    "🌕 Desa diserang werewolf misterius...",
    "🌲 Malam gelap, suara lolongan terdengar...",
    "🏚️ Warga mulai curiga satu sama lain...",
    "🌫️ Kabut tebal menyelimuti desa, bau darah tercium..."
];

module.exports = {
    name: "ww",
    alias: ["werewolf", "cekrole", "cektim", "wwstatus", "wwhelp"],
    description: "Main Werewolf Game",
    execute: async ({ ryzu, from, sender, args, command, reply, funcs }) => {
        try {
            if (!ryzu.werewolf) ryzu.werewolf = {};
            let room = ryzu.werewolf[from];

            let cmdArg = args.shift();
            let targetArg = args.join(" ");

            // Alias Handler
            if (command === "cekrole") cmdArg = "cekrole";
            if (command === "cektim" || command === "wwstatus") cmdArg = "cektim";
            if (command === "wwhelp") cmdArg = "info";

            if (!cmdArg || cmdArg === "") {
                return reply(`📖 *PERINTAH WEREWOLF*\n\n.ww join [nama]\n.ww start\n.ww cektim\n.ww cekrole\n.ww rules\n.ww lb\n.ww kill [nama]\n.ww protect [nama]\n.ww ramal [nama]\n.ww vote [nama]\n.ww out\n.ww reset`);
            }

            switch (cmdArg) {
                case "lb":
                case "leaderboard":
                    let lbType = targetArg || "total_wins";
                    let lb = getLeaderboard(lbType);
                    if (lb.length === 0) return reply("❌ Belum ada data leaderboard.");
                    let textLb = `🏆 *LEADERBOARD WEREWOLF*\n━━━━━━━━━━━━━━━━━\n`;
                    lb.forEach((p, i) => {
                        textLb += `${i + 1}. ${p.username}\n   Win: ${p.wins} | Games: ${p.games} | WR: ${p.winRate}%\n`;
                    });
                    textLb += `━━━━━━━━━━━━━━━━━`;
                    return reply(textLb);

                case "rules":
                    return reply(`📖 *RULES WEREWOLF*\n\n1. Join: .ww join <nama>\n2. Start: .ww start (min 4 orang)\n3. FASE:\n   ☀️ Siang → diskusi\n   🗳️ Voting → pilih target\n   🌙 Malam → role aktif\n4. ROLE:\n   🐺 Werewolf → kill\n   🔮 Seer → ramal\n   🛡️ Guardian → protect\n   👤 Villager → vote\n5. MENANG:\n   - Werewolf = bunuh semua\n   - Villager = eliminate werewolf`);

                case "cekrole":
                    if (!room || room.status !== "playing") return reply("❌ Tidak ada game.");
                    let p = room.player.find(x => x.id === sender);
                    if (!p) return reply("❌ Kamu bukan peserta.");
                    return ryzu.sendMessage(sender, {
                        text: `🎭 *INFORMASI ROLE*\n━━━━━━━━━━━━━━━━━\nRole: *${p.role}*\n${getRoleDescription(p.role)}\nStatus: ${p.alive ? "🟢 Hidup" : "🔴 Mati"}\n━━━━━━━━━━━━━━━━━`
                    });

                case "cektim":
                    if (!room) return reply("❌ Tidak ada room.");
                    let playerList = room.player.map((pl, i) => `${i + 1}. ${pl.nickname} (${pl.alive ? "🟢 Hidup" : "💀 Mati"})`).join("\n");
                    let gameStatus = room.status === "playing"
                        ? `🎮 Hari ke-${room.day}\n⏰ Phase: ${room.phase.toUpperCase()}`
                        : (room.status === "finished" ? `✅ Selesai` : `❌ Menunggu`);
                    return reply(`📊 *STATUS GAME*\n━━━━━━━━━━━━━━━━━\n${gameStatus}\n━━━━━━━━━━━━━━━━━\n\n👥 *PEMAIN:*\n${playerList}`);

                case "info":
                    return reply(`🎭 *ROLES*\n\n🐺 *WEREWOLF*: Bunuh warga.\n🔮 *SEER*: Intip role.\n🛡️ *GUARDIAN*: Lindungi warga.\n👤 *VILLAGER*: Vote siang hari.`);

                case "join":
                    if (room && room.status === "playing") return reply("❌ Game sedang jalan.");
                    if (!room) {
                        ryzu.werewolf[from] = { status: "waiting", player: [], day: 1, phase: "day", history: [], seerUsed: {}, guardianProtected: {}, votes: {} };
                        room = ryzu.werewolf[from];
                    }
                    if (room.player.find(x => x.id === sender)) return reply("❌ Sudah join.");
                    if (room.player.length >= 10) return reply("❌ Room penuh.");
                    let finalName = targetArg || sender.split("@");
                    room.player.push({ id: sender, role: "", alive: true, nickname: finalName });
                    return reply(`✅ Join berhasil! (${room.player.length}/10)`);

                case "start":
                    if (!room || room.player.length < 4) return reply(`❌ Minimal 4 orang.`);
                    if (room.status === "playing") return reply("❌ Sudah mulai.");

                    room.status = "playing";
                    room.day = 1;
                    
                    let roles = getBalancedRoles(room.player.length);
                    let shuffle = roles.sort(() => Math.random() - 0.5);

                    room.player.forEach((pl, i) => {
                        pl.role = shuffle[i] || "VILLAGER";
                        pl.alive = true;
                        ryzu.sendMessage(pl.id, { text: `🎮 *GAME DIMULAI!*\n\n🎭 Role Kamu: *${pl.role}*\n${getRoleDescription(pl.role)}` });
                    });

                    room.scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
                    reply(`🎮 *GAME DIMULAI!*\n\n${room.scenario}\n\n🌅 FASE SIANG - HARI 1`);
                    
                    startPhaseTimer(room, from, ryzu, reply);
                    break;

                case "kill":
                case "protect":
                case "ramal":
                case "vote":
                    handlePlayerAction(cmdArg, room, sender, targetArg, reply, ryzu);
                    break;

                case "out":
                    if (room?.status === "playing") return reply("❌ Game jalan.");
                    room.player = room.player.filter(x => x.id !== sender);
                    if (room.player.length === 0) delete ryzu.werewolf[from];
                    return reply("✅ Berhasil keluar.");

                case "reset":
                    if (room?.timer) clearTimeout(room.timer);
                    delete ryzu.werewolf[from];
                    return reply("✅ Game direset.");

                default:
                    return reply(`🤔 Gunakan .ww untuk bantuan.`);
            }
        } catch (error) {
            console.error("[ERROR WW]:", error);
            reply(`❌ Error: ${error.message}`);
        }
    }
};

// --- HELPER FUNCTIONS (OUTSIDE EXECUTE) ---

function startPhaseTimer(room, from, ryzu, reply) {
    if (room.timer) clearTimeout(room.timer);

    room.phase = "day";
    reply(`☀️ *FASE SIANG DIMULAI* (Diskusi 5 Menit)`);

    room.timer = setTimeout(() => {
        room.phase = "vote";
        reply(`🗳️ *FASE VOTING DIMULAI* (1 Menit)\nKetik: .ww vote [nama]`);

        room.timer = setTimeout(() => {
            runVoting(room, reply);
            if (checkWinner(room, reply, ryzu)) return;
            startNight(room, from, ryzu, reply);
        }, PHASE_TIME.vote);

    }, PHASE_TIME.day);
}

function startNight(room, from, ryzu, reply) {
    if (room.timer) clearTimeout(room.timer);

    room.phase = "night";
    reply(`🌙 *FASE MALAM DIMULAI* (1 Menit)\nWerewolf, Seer, & Guardian silakan beraksi!`);

    room.timer = setTimeout(() => {
        room.day++;
        if (checkWinner(room, reply, ryzu)) return;
        startPhaseTimer(room, from, ryzu, reply);
    }, PHASE_TIME.night);
}

function runVoting(room, reply) {
    if (!room.votes || Object.keys(room.votes).length === 0) {
        return reply("❌ Tidak ada voting yang dilakukan.");
    }

    let voteCount = {};
    Object.values(room.votes).forEach(id => {
        voteCount[id] = (voteCount[id] || 0) + 1;
    });

    let maxVotes = Math.max(...Object.values(voteCount));
    let eliminatedId = Object.keys(voteCount).find(id => voteCount[id] === maxVotes);
    let target = room.player.find(x => x.id === eliminatedId);

    if (target) {
        target.alive = false;
        reply(`💀 Hasil voting: *${target.nickname}* dieksekusi warga!`);
    }
    room.votes = {}; // Reset votes
}

function handlePlayerAction(action, room, sender, targetArg, reply, ryzu) {
    if (!room || room.status !== "playing") return reply("❌ Game tidak aktif.");
    let user = room.player.find(x => x.id === sender);
    if (!user || !user.alive) return reply("❌ Kamu sudah mati atau bukan peserta.");

    let target = room.player.find(x => x.nickname.toLowerCase() === targetArg.toLowerCase());
    if (!target && action !== "vote") return reply("❌ Target tidak ditemukan.");

    if (action === "vote") {
        if (room.phase !== "day" && room.phase !== "vote") return reply("❌ Hanya bisa vote saat siang/voting.");
        if (!target || !target.alive) return reply("❌ Target tidak valid.");
        room.votes[sender] = target.id;
        return reply(`✅ Kamu mem-vote ${target.nickname}`);
    }

    if (room.phase !== "night") return reply("❌ Skill hanya aktif di malam hari.");

    switch (action) {
        case "kill":
            if (user.role !== "WEREWOLF") return reply("❌ Kamu bukan Werewolf.");
            if (room.guardianProtected[room.day] === target.id) {
                return reply(`✅ Target dipilih. (Diam-diam dilindungi Guardian)`);
            }
            target.alive = false;
            return reply(`✅ Mangsa dipilih: ${target.nickname}`);

        case "protect":
            if (user.role !== "GUARDIAN") return reply("❌ Kamu bukan Guardian.");
            room.guardianProtected[room.day] = target.id;
            return reply(`✅ Kamu melindungi ${target.nickname}`);

        case "ramal":
            if (user.role !== "SEER") return reply("❌ Kamu bukan Seer.");
            if (room.seerUsed[room.day]) return reply("❌ Sudah meramal hari ini.");
            room.seerUsed[room.day] = true;
            return ryzu.sendMessage(sender, { text: `🔮 Hasil: ${target.nickname} adalah *${target.role}*` });
    }
}

function checkWinner(room, reply, ryzu) {
    let wolves = room.player.filter(p => p.role === "WEREWOLF" && p.alive).length;
    let villagers = room.player.filter(p => p.role !== "WEREWOLF" && p.alive).length;

    if (wolves === 0) {
        reply("🎉 *VILLAGER MENANG!* Semua Werewolf telah musnah.");
        room.status = "finished";
        if (room.timer) clearTimeout(room.timer);
        return true;
    }
    if (wolves >= villagers) {
        reply("💀 *WEREWOLF MENANG!* Desa telah dikuasai.");
        room.status = "finished";
        if (room.timer) clearTimeout(room.timer);
        return true;
    }
    return false;
}

function getRoleDescription(role) {
    const desc = {
        "WEREWOLF": "🐺 Bunuh warga di malam hari (.ww kill [nama])",
        "VILLAGER": "👤 Cari werewolf dan vote di siang hari (.ww vote [nama])",
        "SEER": "🔮 Intip role orang lain di malam hari (.ww ramal [nama])",
        "GUARDIAN": "🛡️ Lindungi satu orang dari serangan (.ww protect [nama])",
        "FARMER": "🌾 Warga desa biasa dengan semangat tani."
    };
    return desc[role] || "Role rahasia.";
}