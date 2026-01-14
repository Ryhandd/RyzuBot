const dura = require('../../lib/durability');
const { safeNum, addMoney } = require('../../lib/rpgUtils');

module.exports = {
    name: "repair",
    execute: async ({ reply, args, sender, funcs }) => {

        funcs.checkUser(sender);
        const user = global.rpg[sender];

        // ===== SANITIZE =====
        user.money = safeNum(user.money);
        user.batu = safeNum(user.batu);
        user.besi = safeNum(user.besi);
        user.emas = safeNum(user.emas);
        user.diamond = safeNum(user.diamond);

        user.durability = user.durability || {};

        const item = args[0]?.toLowerCase();
        if (!["sword", "armor", "rod"].includes(item))
            return reply("🛠️ Gunakan: .repair <sword|armor|rod>");

        if (!user[item])
            return reply(`❌ Kamu belum punya ${item}.`);

        const tier = user[item];
        const max = dura.max(tier);
        const cur = safeNum(user.durability[item]);

        if (cur >= max)
            return reply("✅ Durability masih penuh.");

        const cost = {
            stone: { batu: 10, money: 2000 },
            iron: { besi: 10, money: 5000 },
            gold: { emas: 5, money: 8000 },
            diamond: { diamond: 3, money: 15000 },
            netherite: { diamond: 10, money: 30000 }
        };

        const req = cost[tier];
        let kurang = [];

        // ===== CEK BAHAN =====
        for (const k in req) {
            const have = safeNum(user[k]);
            if (have < req[k])
                kurang.push(`${k} (${req[k] - have})`);
        }

        if (kurang.length)
            return reply(`❌ *BAHAN KURANG!*\n${kurang.join(', ')}`);

        // ===== POTONG BAHAN =====
        for (const k in req) {
            if (k === "money") {
                addMoney(user, -req[k]);
            } else {
                user[k] = safeNum(user[k]) - req[k];
            }
        }

        // ===== REPAIR =====
        user.durability[item] = max;

        funcs.saveRPG();

        return reply(
            `🛠️ *REPAIR BERHASIL!*\n\n` +
            `Item: ${tier.toUpperCase()} ${item.toUpperCase()}\n` +
            `Durability: ${max}/${max}`
        );
    }
};
