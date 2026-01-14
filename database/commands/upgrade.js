<<<<<<< HEAD
const tier = require('../../lib/tier');
const dura = require('../../lib/durability');
const { safeNum, addMoney } = require('../../lib/rpgUtils');

module.exports = {
    name: "upgrade",
    execute: async ({ reply, args, sender, funcs }) => {

        funcs.checkUser(sender);
        const user = global.rpg[sender];

        // ===== SANITIZE =====
        user.money = safeNum(user.money);
        user.besi = safeNum(user.besi);
        user.emas = safeNum(user.emas);
        user.diamond = safeNum(user.diamond);

        user.durability = user.durability || {};

        const item = args[0]?.toLowerCase();
        if (!["sword", "armor", "rod"].includes(item))
            return reply("⬆️ Gunakan: .upgrade <sword|armor|rod>");

        if (!user[item])
            return reply(`❌ Kamu belum punya ${item}. Craft dulu.`);

        if (tier.isMax(user[item]))
            return reply("✅ Item ini sudah tier maksimal (Netherite).");

        const upgradeCost = {
            stone:   { besi: 10, money: 3000 },
            iron:    { emas: 5, money: 8000 },
            gold:    { diamond: 3, money: 15000 },
            diamond: { diamond: 8, money: 30000 }
        };

        const current = user[item];
        const req = upgradeCost[current];
        let kurang = [];

        // ===== CEK BAHAN =====
        for (const k in req) {
            const have = safeNum(user[k]);
            if (have < req[k])
                kurang.push(`${k} (${req[k] - have})`);
        }

        if (kurang.length)
            return reply(`❌ *BAHAN KURANG!*\n${kurang.join(", ")}`);

        // ===== POTONG BAHAN =====
        for (const k in req) {
            if (k === "money") {
                addMoney(user, -req[k]);
            } else {
                user[k] = safeNum(user[k]) - req[k];
            }
        }

        const before = current.toUpperCase();

        // ===== UPGRADE =====
        user[item] = tier.next(current);
        user.durability[item] = dura.max(user[item]);

        const after = user[item].toUpperCase();

        funcs.saveRPG();

        // ===== PESAN =====
        let detail = Object.entries(req)
            .map(([k, v]) => `• ${v} ${k}`)
            .join("\n");

        return reply(
            `⬆️ *UPGRADE BERHASIL!*\n\n` +
            `🛠️ Item: *${item.toUpperCase()}*\n` +
            `🔁 Dari: ${before} → ${after}\n\n` +
            `📦 Material Digunakan:\n${detail}`
        );
    }
};
=======
const tier = require('../../lib/tier');
const dura = require('../../lib/durability');
const { safeNum, addMoney } = require('../../lib/rpgUtils');

module.exports = {
    name: "upgrade",
    execute: async ({ reply, args, sender, funcs }) => {

        funcs.checkUser(sender);
        const user = global.rpg[sender];

        // ===== SANITIZE =====
        user.money = safeNum(user.money);
        user.besi = safeNum(user.besi);
        user.emas = safeNum(user.emas);
        user.diamond = safeNum(user.diamond);

        user.durability = user.durability || {};

        const item = args[0]?.toLowerCase();
        if (!["sword", "armor", "rod"].includes(item))
            return reply("⬆️ Gunakan: .upgrade <sword|armor|rod>");

        if (!user[item])
            return reply(`❌ Kamu belum punya ${item}. Craft dulu.`);

        if (tier.isMax(user[item]))
            return reply("✅ Item ini sudah tier maksimal (Netherite).");

        const upgradeCost = {
            stone:   { besi: 10, money: 3000 },
            iron:    { emas: 5, money: 8000 },
            gold:    { diamond: 3, money: 15000 },
            diamond: { diamond: 8, money: 30000 }
        };

        const current = user[item];
        const req = upgradeCost[current];
        let kurang = [];

        // ===== CEK BAHAN =====
        for (const k in req) {
            const have = safeNum(user[k]);
            if (have < req[k])
                kurang.push(`${k} (${req[k] - have})`);
        }

        if (kurang.length)
            return reply(`❌ *BAHAN KURANG!*\n${kurang.join(", ")}`);

        // ===== POTONG BAHAN =====
        for (const k in req) {
            if (k === "money") {
                addMoney(user, -req[k]);
            } else {
                user[k] = safeNum(user[k]) - req[k];
            }
        }

        const before = current.toUpperCase();

        // ===== UPGRADE =====
        user[item] = tier.next(current);
        user.durability[item] = dura.max(user[item]);

        const after = user[item].toUpperCase();

        funcs.saveRPG();

        // ===== PESAN =====
        let detail = Object.entries(req)
            .map(([k, v]) => `• ${v} ${k}`)
            .join("\n");

        return reply(
            `⬆️ *UPGRADE BERHASIL!*\n\n` +
            `🛠️ Item: *${item.toUpperCase()}*\n` +
            `🔁 Dari: ${before} → ${after}\n\n` +
            `📦 Material Digunakan:\n${detail}`
        );
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
