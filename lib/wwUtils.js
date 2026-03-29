const updatePlayerStats = (playerId, roleWon, hadiah) => {
    if (!global.rpg[playerId]) return; // Safety check
    if (!global.rpg[playerId].ww_stats) {
        global.rpg[playerId].ww_stats = {
            total_games: 0, total_wins: 0, money_earned: 0,
            role_stats: { 
                "WEREWOLF": { played: 0, won: 0 }, 
                "VILLAGER": { played: 0, won: 0 },
                "SEER": { played: 0, won: 0 },
                "GUARDIAN": { played: 0, won: 0 },
                "FARMER": { played: 0, won: 0 }
            }
        };
    }
    global.rpg[playerId].ww_stats.total_games++;
    global.rpg[playerId].ww_stats.total_wins++;
    global.rpg[playerId].ww_stats.money_earned += hadiah;
    
    if (global.rpg[playerId].ww_stats.role_stats[roleWon]) {
        global.rpg[playerId].ww_stats.role_stats[roleWon].played++;
        global.rpg[playerId].ww_stats.role_stats[roleWon].won++;
    }
};

const getBalancedRoles = (playerCount) => {
    const configs = {
        4: ["WEREWOLF", "SEER", "VILLAGER", "VILLAGER"],
        5: ["WEREWOLF", "SEER", "GUARDIAN", "VILLAGER", "VILLAGER"],
        6: ["WEREWOLF", "SEER", "GUARDIAN", "FARMER", "VILLAGER", "VILLAGER"],
        7: ["WEREWOLF", "WEREWOLF", "SEER", "GUARDIAN", "FARMER", "VILLAGER", "VILLAGER"],
        8: ["WEREWOLF", "WEREWOLF", "SEER", "GUARDIAN", "FARMER", "VILLAGER", "VILLAGER", "VILLAGER"]
    };
    return configs[playerCount] || configs;
};

module.exports = { updatePlayerStats, getBalancedRoles };