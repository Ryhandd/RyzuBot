const { safeNum, addMoney } = require('../../lib/rpgUtils');
const durability = require('../../lib/durability');

module.exports = {
    name: "shop",
    alias: ["buy", "sell"],
    execute: async ({ reply, args, command, sender, funcs }) => {

        const user = global.rpg[sender];
        if (!user) return reply("❌ Data user tidak ditemukan.");

        user.money = safeNum(user.money);
        user.gacha_ticket = safeNum(user.gacha_ticket);
        user.inventory ||= [];

        const format = (n) => n.toLocaleString('id-ID');

        // ================= ITEM DATA =================
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

            gacha_ticket: 25000
        };

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
            let text = `┏━━━ 🛒 *RPG SHOP* ━━━\n`;
            text += `┃ 💰 Uang: ${format(user.money)}\n`;
            text += `┗━━━━━━━━━━━━━━━━━━━\n\n`;

            text += `📌 *Cara Pakai*\n`;
            text += `• .buy <item> <jumlah>\n`;
            text += `• .sell <item> <jumlah>\n`;

            for (let i in buyItems)
                text += `🛍️ ${i.padEnd(12)} : ${format(buyItems[i])}\n`;

            text += `\n💰 *Harga Jual*\n`;
            for (let i in sellItems)
                text += `💸 ${i.padEnd(12)} : ${format(sellItems[i])}\n`;

            text += `\n🎒 *Harga Jual Gacha Item*\n`;

            const gachaPrice = {
                common: 500,
                rare: 2000,
                epic: 5000,
                legendary: 20000,
                limited: 50000
            };

            for (let r in gachaPrice) {
                text += `⭐ ${r.padEnd(10)} : ${format(gachaPrice[r])} (max)\n`;
            }

            text += `\nℹ️ Harga tergantung durability\n`;

            return reply(text);
        }

        const item = args[0]?.toLowerCase();
        const amount = Math.max(1, safeNum(args[1], 1));

        // ================= BUY =================
        if (command === "buy") {

            if (!buyItems[item])
                return reply(`❌ Item *${item}* tidak tersedia.`);

            const totalPrice = buyItems[item] * amount;

            if (user.money < totalPrice)
                return reply(`❌ Uang kurang ${format(totalPrice - user.money)}`);

            if (item === "gacha_ticket") {
                addMoney(user, -totalPrice);
                user.gacha_ticket += amount;

                await funcs.saveRPG(sender);
                return reply(
                    `🎟️ Beli ${amount} Gacha Ticket\n` +
                    `💰 Harga: ${format(totalPrice)}`
                );
            }

            user[item] = safeNum(user[item]);

            addMoney(user, -totalPrice);
            user[item] += amount;

            await funcs.saveRPG(sender);
            return reply(
                `✅ Beli ${amount} ${item}\n` +
                `💰 Harga: ${format(totalPrice)}`
            );
        }

        // ================= SELL =================
        if (command === "sell") {

            // ===== INVENTORY SELL =====
            const invItems = user.inventory.filter(i => i.name === item);

            if (invItems.length) {

                const priceTable = {
                    common: 500,
                    rare: 2000,
                    epic: 5000,
                    legendary: 20000,
                    limited: 50000
                };

                let totalPrice = 0;
                let sold = 0;

                for (let i = user.inventory.length - 1; i >= 0; i--) {
                    const it = user.inventory[i];

                    if (it.name !== item) continue;
                    if (sold >= amount) break;

                    const base = priceTable[it.rarity] || 0;
                    const maxDur = durability.max(it.tier);

                    const price = Math.floor(base * (it.durability / maxDur));

                    totalPrice += price;
                    sold++;

                    user.inventory.splice(i, 1);
                }

                if (sold === 0)
                    return reply(`❌ Kamu tidak punya ${item}`);

                addMoney(user, totalPrice);

                await funcs.saveRPG(sender);

                return reply(
                    `💰 Jual ${item} x${sold}\n` +
                    `💵 Total: ${format(totalPrice)}\n` +
                    `💳 Saldo: ${format(user.money)}`
                );
            }

            // ===== NORMAL SELL =====
            if (!sellItems[item])
                return reply(`❌ Item *${item}* tidak bisa dijual.`);

            user[item] = safeNum(user[item]);

            if (user[item] < amount)
                return reply(`❌ Kamu cuma punya ${user[item]} ${item}`);

            const totalPrice = sellItems[item] * amount;

            user[item] -= amount;
            addMoney(user, totalPrice);

            await funcs.saveRPG(sender);

            return reply(
                `💰 Jual ${amount} ${item}\n` +
                `💵 Dapat: ${format(totalPrice)}`
            );
        }
    }
};