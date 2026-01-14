const tierValue = {
    stone: 1,
    iron: 2,
    gold: 3,
    diamond: 4,
    netherite: 5
};

module.exports = {
    swordDropBonus(tier, durability) {
        if (!tier || durability <= 0) return 1;
        return 1 + tierValue[tier] * 0.05;
    },

    armorReduce(tier, durability) {
        if (!tier || durability <= 0) return 0;
        return Math.min(tierValue[tier] * 0.08, 0.40);
    },

    rodFishingBonus(tier, durability) {
        if (!tier || durability <= 0) return 1;
        return 1 + tierValue[tier] * 0.10;
    }
};
