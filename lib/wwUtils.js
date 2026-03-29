// ============================================
// File: lib/wwUtils.js
// Fungsi Utama Werewolf Game
// ============================================

function updatePlayerStats(playerId, roleWon, hadiah, funcs) {
    if (funcs && typeof funcs.checkUser === 'function') {
        funcs.checkUser(playerId);
    }
    
    if (!global.rpg[playerId]) return; // Safety check
    
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
            let totalGames = stats.total_games || 1; // Prevent division by zero
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
    
    // Sort berdasarkan type
    if (type === "winrate") {
        players.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
    } else {
        players.sort((a, b) => b.wins - a.wins);
    }
    
    return players.slice(0, 10); // Ambil Top 10 saja
}

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
    return history;
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

// Export semua fungsinya
module.exports = { 
    name: 'wwUtils',
    updatePlayerStats, 
    getLeaderboard, 
    saveGameHistory,
    getBalancedRoles 
};