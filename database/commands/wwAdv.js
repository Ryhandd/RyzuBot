function updatePlayerStats(playerId, roleWon, hadiah) {
    funcs.checkUser(playerId);
    
    if (!global.rpg[playerId].ww_stats) {
        global.rpg[playerId].ww_stats = {
            total_games: 0,
            total_wins: 0,
            total_loss: 0,
            money_earned: 0,
            role_stats: {
                "WEREWOLF": { played: 0, won: 0, lost: 0 },
                "VILLAGER": { played: 0, won: 0, lost: 0 },
                "SEER": { played: 0, won: 0, lost: 0 },
                "GUARDIAN": { played: 0, won: 0, lost: 0 },
                "FARMER": { played: 0, won: 0, lost: 0 }
            }
        };
    }
    
    global.rpg[playerId].ww_stats.total_games++;
    global.rpg[playerId].ww_stats.total_wins++;
    global.rpg[playerId].ww_stats.money_earned += hadiah;
    
    let stats = global.rpg[playerId].ww_stats.role_stats[roleWon];
    stats.played++;
    stats.won++;
}

function getLeaderboard(type = "total_wins") {
    let players = [];
    
    for (let userId in global.rpg) {
        let stats = global.rpg[userId].ww_stats;
        if (stats) {
            players.push({
                id: userId,
                username: global.rpg[userId].name || userId.split("@")[0],
                wins: stats.total_wins,
                games: stats.total_games,
                winRate: ((stats.total_wins / stats.total_games) * 100).toFixed(1),
                money: stats.money_earned
            });
        }
    }
    
    // Sort berdasarkan type
    if (type === "winrate") {
        players.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
    } else {
        players.sort((a, b) => b.wins - a.wins);
    }
    
    return players;
}

// Implementasi di command:
if (args[0] === "leaderboard" || args[0] === "lb") {
    let lb = getLeaderboard(args[1] || "total_wins");
    let text = `🏆 *LEADERBOARD WEREWOLF*\n━━━━━━━━━━━━━━━━━\n`;
    
    lb.forEach((p, i) => {
        text += `${i+1}. ${p.username}\n   Win: ${p.wins} | Games: ${p.games} | WR: ${p.winRate}%\n`;
    });
    
    text += `━━━━━━━━━━━━━━━━━\nDipilih: ${args[1] || "total_wins"}`;
    reply(text);
}

// ============================================
// 2. GAME HISTORY & REPLAY
// ============================================

// Simpan game ke database/file:

function saveGameHistory(room, from) {
    let history = {
        group: from,
        date: new Date(),
        totalDays: room.day,
        totalPlayers: room.player.length,
        winner: room.winner || "unknown",
        players: room.player.map(p => ({
            name: p.nickname,
            role: p.role,
            alive: p.alive,
            hadiah: p.hadiah || 0
        })),
        events: room.history
    };
    
    // Simpan ke database atau file
    // db.gameHistory.insert(history);
    
    return history;
}

// Tampilkan recap game:
if (args[0] === "recap") {
    if (!room || room.status !== "finished") {
        return reply("❌ Game ini tidak ada atau masih berlangsung");
    }
    
    let recap = saveGameHistory(room, from);
    let text = `📊 *RECAP GAME*\n━━━━━━━━━━━━━━━━━\n`;
    text += `📅 Tanggal: ${recap.date}\n`;
    text += `👥 Total Pemain: ${recap.totalPlayers}\n`;
    text += `📆 Total Hari: ${recap.totalDays}\n`;
    text += `🏆 Pemenang: ${recap.winner.toUpperCase()}\n\n`;
    
    text += `📋 Detail Pemain:\n`;
    recap.players.forEach(p => {
        text += `• ${p.name} - ${p.role} (${p.alive ? "Hidup" : "Mati"}) - +${p.hadiah} Money\n`;
    });
    
    text += `\n📝 Kronologi Event:\n`;
    recap.events.slice(0, 5).forEach(e => {
        text += `• [Hari ${e.day} ${e.phase}] ${e.event}\n`;
    });
    
    reply(text);
}

// ============================================
// 3. ROLE DESCRIPTION & TIPS
// ============================================

// Expand getRoleDescription untuk lebih detail:

function getDetailedRoleInfo(role) {
    const details = {
        "WEREWOLF": {
            description: "Penjahat yang membunuh warga di malam hari",
            ability: "Bunuh 1 warga setiap malam (.ww kill @user)",
            strength: [
                "Bisa eliminate target yang specific",
                "Koordinasi dengan werewolf lain",
                "Acting sebagai villager"
            ],
            weakness: [
                "Voting majority bisa eliminate",
                "Seer bisa expose identity",
                "Guardians bisa block kill"
            ],
            strategy: [
                "Diskusi aktif untuk avoid suspicion",
                "Target Seer dulu",
                "Koordinasikan dengan werewolf lain",
                "Use voting pressure untuk misdirect"
            ],
            tips: "Jangan terlalu defensive, act natural"
        },
        "VILLAGER": {
            description: "Warga biasa tanpa kemampuan khusus",
            ability: "Vote eliminate setiap siang (.ww vote @user)",
            strength: [
                "Majority power saat voting",
                "Bisa bekerja sama dengan role special",
                "No indicator dari werewolf"
            ],
            weakness: [
                "Tidak ada info tentang siapa werewolf",
                "Rentan untuk di-eliminate voting",
                "Mudah untuk di-target werewolf"
            ],
            strategy: [
                "Observe perilaku pemain lain",
                "Trust role special jika proven",
                "Vote berdasarkan logical reasoning",
                "Coordinate dengan group"
            ],
            tips: "Dengarkan baik-baik diskusi grup"
        },
        "SEER": {
            description: "Peramal yang bisa detect role orang",
            ability: "Ramal 1 orang per malam (.ww ramal @user)",
            strength: [
                "Bisa detect werewolf 100% akurat",
                "Guide team villager dengan info",
                "Key player untuk kemenangan villager"
            ],
            weakness: [
                "Sangat diincar werewolf",
                "Mudah di-suspect jika carelessly",
                "Hanya ramal 1x per hari"
            ],
            strategy: [
                "Jangan reveal terlalu cepat",
                "Hint subtle jika tau werewolf",
                "Ramal orang yang suspicious",
                "Coordinate dengan guardian untuk protect"
            ],
            tips: "Patience is key, tunggu moment yang tepat"
        },
        "GUARDIAN": {
            description: "Penjaga yang melindungi warga",
            ability: "Lindungi 1 orang setiap malam (.ww protect @user)",
            strength: [
                "Bisa block kill werewolf",
                "Protect key player (Seer, Farmer)",
                "Strategis power untuk late game"
            ],
            weakness: [
                "Tidak bisa protect sama orang 2x",
                "Tidak tahu siapa werewolf",
                "Blind protection (guess based)"
            ],
            strategy: [
                "Protect Seer jika sudah tau identity",
                "Rotasi perlindungan untuk unpredictable",
                "Sync dengan Seer jika coordinated",
                "Late game: protect confirmed village"
            ],
            tips: "Jangan terlalu predictable dengan rotation"
        },
        "FARMER": {
            description: "Petani dengan kemampuan win otomatis",
            ability: "Auto-win jika hanya satu-satunya villager yang alive",
            strength: [
                "Win condition alternatif untuk villager",
                "Bertahan = menang (late game)",
                "Pressure psikologis ke werewolf"
            ],
            weakness: [
                "Sangat diincar untuk di-eliminate",
                "High priority target",
                "Jelas akan suspicious"
            ],
            strategy: [
                "Low profile, act normal",
                "Jangan vote suspicious (attract attention)",
                "Coordinate dengan guardian untuk protect",
                "Stay alive sampai end game"
            ],
            tips: "Play it safe, focus on survival"
        }
    };
    
    return details[role];
}

// ============================================
// 4. CUSTOM GAME MODES
// ============================================

// MODE: HARDCORE (Instant elimination without discussion)
if (args[0] === "hardcore") {
    room.mode = "hardcore";
    room.discussionTime = 30; // 30 detik diskusi
    reply("🔥 *HARDCORE MODE ENABLED*\nDiskusi hanya 30 detik!");
}

// MODE: SILENT (No discussion, voting only)
if (args[0] === "silent") {
    room.mode = "silent";
    reply("🤐 *SILENT MODE ENABLED*\nTanpa diskusi, voting langsung!");
}

// MODE: TIMED (Phase dengan timer)
if (args[0] === "timed") {
    room.mode = "timed";
    room.phaseTimer = parseInt(args[1]) || 300; // 5 menit default
    reply(`⏱️ *TIMED MODE*\nSetiap phase: ${room.phaseTimer} detik`);
}

// ============================================
// 5. ROLE BALANCING SYSTEM
// ============================================

function getBalancedRoles(playerCount) {
    const configs = {
        4: ["WEREWOLF", "SEER", "VILLAGER", "VILLAGER"],
        5: ["WEREWOLF", "SEER", "GUARDIAN", "VILLAGER", "VILLAGER"],
        6: ["WEREWOLF", "SEER", "GUARDIAN", "FARMER", "VILLAGER", "VILLAGER"],
        7: ["WEREWOLF", "WEREWOLF", "SEER", "GUARDIAN", "FARMER", "VILLAGER", "VILLAGER"],
        8: ["WEREWOLF", "WEREWOLF", "SEER", "GUARDIAN", "FARMER", "VILLAGER", "VILLAGER", "VILLAGER"],
        9: ["WEREWOLF", "WEREWOLF", "SEER", "GUARDIAN", "FARMER", "PRIEST", "VILLAGER", "VILLAGER", "VILLAGER"],
        10: ["WEREWOLF", "WEREWOLF", "WEREWOLF", "SEER", "GUARDIAN", "FARMER", "PRIEST", "VILLAGER", "VILLAGER", "VILLAGER"]
    };
    
    return configs[playerCount] || configs[4];
}

// ============================================
// 6. ANTI-CHEAT & VERIFICATION
// ============================================

function verifyAction(player, action, room) {
    // Cek apakah player still alive
    if (!player.alive) {
        return { valid: false, reason: "Player sudah mati" };
    }
    
    // Cek phase
    if (action === "kill" && room.phase !== "night") {
        return { valid: false, reason: "Hanya bisa kill di malam hari" };
    }
    
    if (action === "vote" && room.phase !== "day") {
        return { valid: false, reason: "Hanya bisa vote di siang hari" };
    }
    
    // Cek cooldown (prevent spam)
    let lastAction = player.lastAction?.[action];
    if (lastAction && Date.now() - lastAction < 2000) {
        return { valid: false, reason: "Tunggu 2 detik sebelum action lagi" };
    }
    
    player.lastAction = player.lastAction || {};
    player.lastAction[action] = Date.now();
    
    return { valid: true };
}

// ============================================
// 7. DYNAMIC DIFFICULTY
// ============================================

function getDifficultyConfig(difficulty = "normal") {
    const configs = {
        "easy": {
            werewolfCount: 1, // Max 1 werewolf
            specialRoles: ["SEER", "GUARDIAN", "FARMER"],
            discussionTime: 120,
            reward: 1 // 1x normal reward
        },
        "normal": {
            werewolfCount: 2,
            specialRoles: ["SEER", "GUARDIAN"],
            discussionTime: 60,
            reward: 1
        },
        "hard": {
            werewolfCount: 3,
            specialRoles: ["SEER"],
            discussionTime: 30,
            reward: 2 // 2x normal reward
        },
        "insane": {
            werewolfCount: 4,
            specialRoles: [],
            discussionTime: 15,
            reward: 3 // 3x normal reward
        }
    };
    
    return configs[difficulty] || configs["normal"];
}

// ============================================
// 8. SPECIAL ITEMS SYSTEM
// ============================================

// Werewolf bisa pake items untuk buff aksi
const specialItems = {
    "enhanced_kill": {
        name: "Enhanced Kill Potion",
        cost: 10000,
        effect: "Kill tidak bisa di-protect",
        duration: 1 // 1 night only
    },
    "detection_amulet": {
        name: "Detection Amulet",
        cost: 15000,
        effect: "Guardian protection terdeteksi",
        duration: 1
    },
    "truth_serum": {
        name: "Truth Serum",
        cost: 20000,
        effect: "Seer ramal bisa 2x hari ini",
        duration: 1
    }
};

// ============================================
// 9. TOURNAMENT MODE
// ============================================

// Struktur tournament
let tournament = {
    name: "WW Championship 2024",
    rounds: [],
    players: [],
    standings: [],
    
    startTournament() {
        // Bracket system
        // Best of 3 rounds
        // Accumulative scoring
    },
    
    recordMatch(winner, loser, score) {
        this.standings.push({
            winner, loser, score, date: new Date()
        });
    },
    
    getStandings() {
        let standings = {};
        this.standings.forEach(match => {
            standings[match.winner] = (standings[match.winner] || 0) + 3;
            standings[match.loser] = (standings[match.loser] || 0) + 1;
        });
        
        return Object.entries(standings)
            .sort(([, a], [, b]) => b - a)
            .map(([player, score]) => ({ player, score }));
    }
};

// ============================================
// 10. CUSTOM NOTIFICATIONS
// ============================================

async function notifyPlayers(room, message, role = null) {
    for (let player of room.player) {
        // Filter by role jika ada
        if (role && player.role !== role) continue;
        
        // Send notification
        await ryzu.sendMessage(player.id, { text: message });
    }
}

// Usage dalam game:
// Saat kill:
// notifyPlayers(room, "🌙 Malam hari, werewolf sedang berburu...", "WEREWOLF");

// ============================================
// SUMMARY OF FEATURES
// ============================================

/*
✅ IMPLEMENTED:
- 5 Role (Werewolf, Villager, Seer, Guardian, Farmer)
- Day/Night cycle
- Role-specific actions
- Voting system
- Win conditions
- Reward system

🚀 CAN BE ADDED:
- Leaderboard & Statistics
- Game History & Replay
- Detailed Role Tips
- Game Modes (Hardcore, Silent, Timed)
- Role Balancing
- Anti-Cheat System
- Difficulty Levels
- Special Items
- Tournament Mode
- Custom Notifications

💡 FUTURE POSSIBILITIES:
- More roles (Doctor, Cop, Priest, etc.)
- Cross-server tournaments
- Trading cards/skins
- Daily quests
- Achievement system
- Voice integration
- Web dashboard
- Mobile app
*/

module.exports = {
    updatePlayerStats,
    getLeaderboard,
    saveGameHistory,
    getDetailedRoleInfo,
    getBalancedRoles,
    verifyAction,
    getDifficultyConfig,
    specialItems,
    notifyPlayers
};