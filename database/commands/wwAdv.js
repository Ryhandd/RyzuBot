// ============================================
// File: wwAdv.js (Fungsi Tambahan Werewolf)
// ============================================

function updatePlayerStats(playerId, roleWon, hadiah) {
    // Pastikan funcs.checkUser ada jika kamu mau memanggilnya dari luar
    if (!global.rpg[playerId]) return;
    
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
    if (stats) {
        stats.played++;
        stats.won++;
    }
}

function getLeaderboard(type = "total_wins") {
    let players = [];
    
    for (let userId in global.rpg) {
        let stats = global.rpg[userId].ww_stats;
        if (stats) {
            let totalGames = stats.total_games || 1;
            players.push({
                id: userId,
                username: global.rpg[userId].name || userId.split("@"),
                wins: stats.total_wins,
                games: stats.total_games,
                winRate: ((stats.total_wins / totalGames) * 100).toFixed(1),
                money: stats.money_earned
            });
        }
    }
    
    if (type === "winrate") {
        players.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
    } else {
        players.sort((a, b) => b.wins - a.wins);
    }
    
    return players;
}

function saveGameHistory(room, from) {
    return {
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
}

function getDetailedRoleInfo(role) {
    const details = {
        "WEREWOLF": {
            description: "Penjahat yang membunuh warga di malam hari",
            ability: "Bunuh 1 warga setiap malam (.ww kill @user)",
            strength: ["Bisa eliminate target yang specific", "Koordinasi dengan werewolf lain"],
            weakness: ["Voting majority bisa eliminate", "Seer bisa expose identity"],
            strategy: ["Diskusi aktif untuk avoid suspicion", "Target Seer dulu"],
            tips: "Jangan terlalu defensive, act natural"
        },
        "VILLAGER": {
            description: "Warga biasa tanpa kemampuan khusus",
            ability: "Vote eliminate setiap siang (.ww vote @user)",
            strength: ["Majority power saat voting", "No indicator dari werewolf"],
            weakness: ["Tidak ada info tentang siapa werewolf", "Mudah untuk di-target werewolf"],
            strategy: ["Observe perilaku pemain lain", "Trust role special jika proven"],
            tips: "Dengarkan baik-baik diskusi grup"
        },
        "SEER": {
            description: "Peramal yang bisa detect role orang",
            ability: "Ramal 1 orang per malam (.ww ramal @user)",
            strength: ["Bisa detect werewolf 100% akurat", "Guide team villager dengan info"],
            weakness: ["Sangat diincar werewolf", "Hanya ramal 1x per hari"],
            strategy: ["Jangan reveal terlalu cepat", "Coordinate dengan guardian untuk protect"],
            tips: "Patience is key, tunggu moment yang tepat"
        },
        "GUARDIAN": {
            description: "Penjaga yang melindungi warga",
            ability: "Lindungi 1 orang setiap malam (.ww protect @user)",
            strength: ["Bisa block kill werewolf", "Protect key player (Seer, Farmer)"],
            weakness: ["Tidak bisa protect sama orang 2x", "Blind protection (guess based)"],
            strategy: ["Protect Seer jika sudah tau identity", "Late game: protect confirmed village"],
            tips: "Jangan terlalu predictable dengan rotation"
        },
        "FARMER": {
            description: "Petani dengan kemampuan win otomatis",
            ability: "Auto-win jika hanya satu-satunya villager yang alive",
            strength: ["Win condition alternatif untuk villager", "Bertahan = menang (late game)"],
            weakness: ["Sangat diincar untuk di-eliminate", "High priority target"],
            strategy: ["Low profile, act normal", "Stay alive sampai end game"],
            tips: "Play it safe, focus on survival"
        }
    };
    return details[role];
}

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
    return configs[playerCount] || configs;
}

function verifyAction(player, action, room) {
    if (!player.alive) return { valid: false, reason: "Player sudah mati" };
    if (action === "kill" && room.phase !== "night") return { valid: false, reason: "Hanya bisa kill di malam hari" };
    if (action === "vote" && room.phase !== "day") return { valid: false, reason: "Hanya bisa vote di siang hari" };
    
    let lastAction = player.lastAction?.[action];
    if (lastAction && Date.now() - lastAction < 2000) return { valid: false, reason: "Tunggu 2 detik sebelum action lagi" };
    
    player.lastAction = player.lastAction || {};
    player.lastAction[action] = Date.now();
    return { valid: true };
}

function getDifficultyConfig(difficulty = "normal") {
    const configs = {
        "easy": { werewolfCount: 1, specialRoles: ["SEER", "GUARDIAN", "FARMER"], discussionTime: 120, reward: 1 },
        "normal": { werewolfCount: 2, specialRoles: ["SEER", "GUARDIAN"], discussionTime: 60, reward: 1 },
        "hard": { werewolfCount: 3, specialRoles: ["SEER"], discussionTime: 30, reward: 2 },
        "insane": { werewolfCount: 4, specialRoles: [], discussionTime: 15, reward: 3 }
    };
    return configs[difficulty] || configs["normal"];
}

const specialItems = {
    "enhanced_kill": { name: "Enhanced Kill Potion", cost: 10000, effect: "Kill tidak bisa di-protect", duration: 1 },
    "detection_amulet": { name: "Detection Amulet", cost: 15000, effect: "Guardian protection terdeteksi", duration: 1 },
    "truth_serum": { name: "Truth Serum", cost: 20000, effect: "Seer ramal bisa 2x hari ini", duration: 1 }
};

let tournament = {
    name: "WW Championship 2024",
    rounds: [], players: [], standings: [],
    startTournament() {},
    recordMatch(winner, loser, score) {
        this.standings.push({ winner, loser, score, date: new Date() });
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

async function notifyPlayers(room, message, ryzu, role = null) {
    for (let player of room.player) {
        if (role && player.role !== role) continue;
        await ryzu.sendMessage(player.id, { text: message });
    }
}

module.exports = {
    name: "wwAdv",
    description: "Library Module untuk Werewolf",
    execute: async () => {},
    updatePlayerStats,
    getLeaderboard,
    saveGameHistory,
    getDetailedRoleInfo,
    getBalancedRoles,
    verifyAction,
    getDifficultyConfig,
    specialItems,
    tournament,
    notifyPlayers
};