/**
 * Library untuk mengelola item inventory RPG
 * Lokasi: lib/inventory.js
 */

const items_data = {
    // COMMON
    "potion": { name: "🧪 Health Potion", durability: "Sekali Pakai" },
    "gacha_ticket": { name: "🎟️ Gacha Ticket", durability: "Sekali Pakai" },

    // RARE
    "mining_charm": { name: "⛏️ Mining Charm", durability: "100" },
    "fishing_charm": { name: "🎣 Fishing Charm", durability: "100" },
    "hunter_charm": { name: "🏹 Hunter Charm", durability: "100" },

    // EPIC
    "pet_wolf": { name: "🐺 Loyal Wolf", durability: "Infinite" },
    "adventure_badge": { name: "🏅 Adventurer Badge", durability: "Permanent" },

    // LEGENDARY
    "pet_dragon": { name: "🐉 Ancient Dragon", durability: "Infinite" },

    // LIMITED
    "golden_emblem": { name: "🔱 Golden Emblem", durability: "Permanent" },
    "ancient_relic": { name: "🏺 Ancient Relic", durability: "Permanent" }
};

/**
 * Membuat object item lengkap berdasarkan ID dan rarity
 * @param {string} itemId 
 * @param {string} rarity 
 * @returns {object}
 */
function createItem(itemId, rarity) {
    const base = items_data[itemId] || { name: itemId, durability: "Unknown" };
    
    return {
        id: itemId,
        name: base.name,
        rarity: rarity, // 'common', 'rare', dll
        durability: base.durability,
        obtainedAt: Date.now()
    };
}

module.exports = {
    createItem,
    items_data
};