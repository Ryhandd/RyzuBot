const { safeNum, addMoney } = require('../../lib/rpgUtils');

module.exports = {
    name: "shop",
    alias: ["buy", "sell"],
    execute: async ({ reply, args, command, sender, funcs }) => {

        const user = global.rpg[sender];
        if (!user)
            return reply("❌ Data user tidak ditemukan.");

        // ===== SANITIZE =====
        user.money = safeNum(user.money);
        user.gacha_ticket = safeNum(user.gacha_ticket);

        // ================= BUY PRICE =================
        const buyItems = {
            umpan: 500,
            potion: 1000,

            ikan: 400,
            ikan_lele: 800,
            ikan_mas: 1200,
            kepiting: 2000,
            ikan_paus: 20000,

            kayu: 200,
            batu: 200,
            besi: 1200,
            emas: 5000,
            diamond: 25000,

            common: 1500,
            uncommon: 3000,
            mythic: 12000,
            legendary: 50000,

            gacha_ticket: 25000,
            gacha_ticket5: 115000,
            gacha_ticket10: 220000
        };

        // ================= SELL PRICE =================
        const sellItems = {
            ikan: 200,
            ikan_lele: 400,
            ikan_mas: 600,
            kepiting: 1000,
            ikan_paus: 8000,

            kayu: 100,
            batu: 100,
            besi: 600,
            emas: 2500,
            diamond: 12000,

            common: 700,
            uncommon: 1500,
            mythic: 6000,
            legendary: 25000,

            sampah: 10
        };

        // ================= SHOW SHOP =================
        if (!args[0] && command === "shop") {
            let text = `🛒 *RPG SHOP*\n`;
            text += `💰 Uang: ${user.money.toLocaleString('id-ID')}\n\n`;
            text += `📌 *Cara Pakai*\n`;
            text += `• Beli: .buy <item> <jumlah>\n`;
            text += `• Jual: .sell <item> <jumlah>\n\n`;

            text += `🛍️ *DAFTAR BELI*\n`;
            for (let i in buyItems)
                text += `• ${i}: ${buyItems[i].toLocaleString('id-ID')}\n`;

            text += `\n💰 *HARGA JUAL*\n`;
            for (let i in sellItems)
                text += `• ${i}: ${sellItems[i].toLocaleString('id-ID')}\n`;

            text += `\n⚠️ Equipment dibuat via *.craft*`;

            return reply(text);
        }

        const item = args[0]?.toLowerCase();
        const amount = Math.max(1, safeNum(args[1], 1));

        // ================= BUY =================
        if (command === "buy") {

            if (!buyItems[item])
                return reply(`❌ Item *${item}* tidak tersedia di shop.`);

            // ===== GACHA TICKET =====
            if (item.startsWith("gacha_ticket")) {
                let qty = 1;
                if (item === "gacha_ticket5") qty = 5;
                if (item === "gacha_ticket10") qty = 10;

                const price = buyItems[item];
                if (user.money < price)
                    return reply("❌ Uang kamu tidak cukup.");

                addMoney(user, -price);
                user.gacha_ticket += qty;

                funcs.saveRPG();
                return reply(
                    `🎟️ Berhasil beli *${qty} Gacha Ticket*\n` +
                    `💰 Harga: ${price.toLocaleString('id-ID')}\n` +
                    `🎟️ Total Ticket: ${user.gacha_ticket}`
                );
            }

            const price = buyItems[item] * amount;
            if (user.money < price)
                return reply(
                    `❌ Uang kurang ${(price - user.money).toLocaleString('id-ID')}`
                );

            user[item] = safeNum(user[item]);
            addMoney(user, -price);
            user[item] += amount;

            funcs.saveRPG();
            return reply(
                `✅ Berhasil beli *${amount} ${item}*\n` +
                `💰 Harga: ${price.toLocaleString('id-ID')}\n` +
                `💳 Sisa uang: ${user.money.toLocaleString('id-ID')}`
            );
        }

        // ================= SELL =================
        if (command === "sell") {

            if (!sellItems[item])
                return reply(`❌ Item *${item}* tidak bisa dijual.`);

            user[item] = safeNum(user[item]);

            if (user[item] < amount)
                return reply(`❌ Kamu cuma punya ${user[item]} ${item}.`);

            const price = sellItems[item] * amount;

            user[item] -= amount;
            addMoney(user, price);

            funcs.saveRPG();
            return reply(
                `✅ Berhasil jual *${amount} ${item}*\n` +
                `💰 Dapat: ${price.toLocaleString('id-ID')}\n` +
                `💳 Saldo: ${user.money.toLocaleString('id-ID')}`
            );
        }
    }
};
