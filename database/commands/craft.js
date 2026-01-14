<<<<<<< HEAD
const dura = require('../../lib/durability');

module.exports = {
    name: "craft",
    alias: ["create", "bikin"],
    execute: async ({ reply, args, sender, funcs }) => {
        funcs.checkUser(sender);
        const user = global.rpg[sender];

        const item = args[0]?.toLowerCase();
        if (!["sword", "armor", "rod"].includes(item))
            return reply("🔨 Gunakan: .craft <sword|armor|rod>");

        if (user[item])
            return reply(`❌ Kamu sudah punya ${item}. Gunakan *.upgrade ${item}*`);

        const recipe = {
            sword: { kayu: 20, batu: 10, money: 2000 },
            armor: { kayu: 15, besi: 10, money: 3000 },
            rod:   { kayu: 25, besi: 5,  money: 2000 }
        };

        const req = recipe[item];
        let kurang = [];

        for (let k in req) {
            if ((user[k] || 0) < req[k])
                kurang.push(`${k} (${req[k] - user[k]})`);
        }

        if (kurang.length)
            return reply(`❌ *BAHAN KURANG!*\n${kurang.join(", ")}`);

        // Potong bahan
        for (let k in req) user[k] -= req[k];

        user[item] = "stone";
        user.durability[item] = dura.max("stone");

        funcs.saveRPG();

        // ===== PESAN DETAIL =====
        let detail = Object.entries(req)
            .map(([k,v]) => `• ${v} ${k}`)
            .join("\n");

        reply(
            `✅ *CRAFT BERHASIL!*\n\n` +
            `🛠️ Item: *STONE ${item.toUpperCase()}*\n` +
            `📦 Bahan Digunakan:\n${detail}`
        );
    }
};
=======
const dura = require('../../lib/durability');

module.exports = {
    name: "craft",
    alias: ["create", "bikin"],
    execute: async ({ reply, args, sender, funcs }) => {
        funcs.checkUser(sender);
        const user = global.rpg[sender];

        const item = args[0]?.toLowerCase();
        if (!["sword", "armor", "rod"].includes(item))
            return reply("🔨 Gunakan: .craft <sword|armor|rod>");

        if (user[item])
            return reply(`❌ Kamu sudah punya ${item}. Gunakan *.upgrade ${item}*`);

        const recipe = {
            sword: { kayu: 20, batu: 10, money: 2000 },
            armor: { kayu: 15, besi: 10, money: 3000 },
            rod:   { kayu: 25, besi: 5,  money: 2000 }
        };

        const req = recipe[item];
        let kurang = [];

        for (let k in req) {
            if ((user[k] || 0) < req[k])
                kurang.push(`${k} (${req[k] - user[k]})`);
        }

        if (kurang.length)
            return reply(`❌ *BAHAN KURANG!*\n${kurang.join(", ")}`);

        // Potong bahan
        for (let k in req) user[k] -= req[k];

        user[item] = "stone";
        user.durability[item] = dura.max("stone");

        funcs.saveRPG();

        // ===== PESAN DETAIL =====
        let detail = Object.entries(req)
            .map(([k,v]) => `• ${v} ${k}`)
            .join("\n");

        reply(
            `✅ *CRAFT BERHASIL!*\n\n` +
            `🛠️ Item: *STONE ${item.toUpperCase()}*\n` +
            `📦 Bahan Digunakan:\n${detail}`
        );
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
