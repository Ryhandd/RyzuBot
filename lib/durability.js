const maxDurability = {
    stone: 100,
    iron: 200,
    gold: 150,
    diamond: 300,
    netherite: 500
};

module.exports = {
    max(tier) {
        return maxDurability[tier] || 0;
    },

    lose(tier, type) {
        if (!tier) return 0;

        const base = {
            sword: 5,
            armor: 3,
            rod: 2
        };

        let loss = base[type] || 1;

        // gold lebih rapuh
        if (tier === "gold") loss += 2;

        return loss;
    }
};
