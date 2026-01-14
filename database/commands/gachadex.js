<<<<<<< HEAD
module.exports = {
    name: "gachadex",
    alias: ["igacha", "gcollection"],
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        const history = u.gacha_history || [];

        if (history.length === 0)
            return reply("📭 Kamu belum pernah gacha.");

        const tiers = {
            common: [],
            rare: [],
            epic: [],
            legendary: [],
            limited: []
        };

        // kumpulin unik
        history.forEach(h => {
            if (!tiers[h.rarity].includes(h.reward))
                tiers[h.rarity].push(h.reward);
        });

        let text = `🧬 *GACHA COLLECTION*\n`;
        text += `Item yang PERNAH kamu dapatkan\n\n`;

        for (let r in tiers) {
            if (tiers[r].length) {
                text += `🔹 *${r.toUpperCase()}*\n`;
                tiers[r].forEach(i => text += `• ${i}\n`);
                text += `\n`;
            }
        }

        reply(text);
    }
};
=======
module.exports = {
    name: "gachadex",
    alias: ["igacha", "gcollection"],
    execute: async ({ sender, reply }) => {
        const u = global.rpg[sender];
        const history = u.gacha_history || [];

        if (history.length === 0)
            return reply("📭 Kamu belum pernah gacha.");

        const tiers = {
            common: [],
            rare: [],
            epic: [],
            legendary: [],
            limited: []
        };

        // kumpulin unik
        history.forEach(h => {
            if (!tiers[h.rarity].includes(h.reward))
                tiers[h.rarity].push(h.reward);
        });

        let text = `🧬 *GACHA COLLECTION*\n`;
        text += `Item yang PERNAH kamu dapatkan\n\n`;

        for (let r in tiers) {
            if (tiers[r].length) {
                text += `🔹 *${r.toUpperCase()}*\n`;
                tiers[r].forEach(i => text += `• ${i}\n`);
                text += `\n`;
            }
        }

        reply(text);
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
