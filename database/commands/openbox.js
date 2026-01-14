module.exports = {
    name: "openbox",
    alias: ["open", "buka"],
    execute: async ({ ryzu, from, sender, args, reply, funcs, msg }) => {
        const user = global.rpg[sender];
        const boxType = args[0]?.toLowerCase();

        const validBox = ["common", "uncommon", "mythic", "legendary"];
        if (!validBox.includes(boxType)) {
            return reply(
                "📦 *PILIH BOX:*\n" +
                ".open common\n" +
                ".open uncommon\n" +
                ".open mythic\n" +
                ".open legendary"
            );
        }

        if ((user[boxType] || 0) < 1)
            return reply(`❌ Kamu tidak punya *${boxType} box*.`);

        // ===== UTIL =====
        const rand = (min, max) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        // ===== KURANGI BOX =====
        user[boxType] -= 1;

        let reward = {
            money: 0,
            exp: 0,
            kayu: 0,
            batu: 0,
            besi: 0,
            emas: 0,
            diamond: 0
        };

        let jackpot = false;

        // ===== LOOT TABLE =====
        switch (boxType) {
            case "common":
                reward.money = rand(500, 1500);
                reward.exp = rand(100, 400);
                reward.kayu = rand(2, 8);
                reward.batu = rand(2, 8);
                if (Math.random() < 0.08)
                    reward.besi = rand(1, 2);
                break;

            case "uncommon":
                reward.money = rand(2000, 6000);
                reward.exp = rand(400, 900);
                reward.besi = rand(3, 8);
                reward.kayu = rand(5, 15);
                if (Math.random() < 0.15)
                    reward.emas = rand(1, 2);
                break;

            case "mythic":
                reward.money = rand(8000, 20000);
                reward.exp = rand(1500, 3500);
                reward.emas = rand(4, 10);
                reward.besi = rand(8, 15);
                if (Math.random() < 0.08) {
                    reward.diamond = rand(1, 2);
                    jackpot = true;
                }
                break;

            case "legendary":
                reward.money = rand(30000, 80000);
                reward.exp = rand(4000, 10000);
                reward.emas = rand(15, 30);
                reward.diamond = rand(2, 5);
                if (Math.random() < 0.03) {
                    reward.diamond += rand(5, 10); // SUPER JACKPOT
                    jackpot = true;
                }
                break;
        }

        // ===== APPLY REWARD =====
        for (let key in reward) {
            user[key] = (user[key] || 0) + reward[key];
        }

        funcs.saveRPG();
        funcs.cekLevel(sender);

        // ===== MESSAGE =====
        let text = `🎁 *${boxType.toUpperCase()} BOX*\n`;
        if (jackpot) text += `🔥 *JACKPOT!* Kamu super beruntung!\n\n`;
        else text += `\n`;

        if (reward.money) text += `💰 Money: +${reward.money.toLocaleString()}\n`;
        if (reward.exp) text += `✨ EXP: +${reward.exp.toLocaleString()}\n`;
        if (reward.kayu) text += `🪵 Kayu: +${reward.kayu}\n`;
        if (reward.batu) text += `🪨 Batu: +${reward.batu}\n`;
        if (reward.besi) text += `⛓️ Besi: +${reward.besi}\n`;
        if (reward.emas) text += `🥇 Emas: +${reward.emas}\n`;
        if (reward.diamond) text += `💎 Diamond: +${reward.diamond}\n`;

        text += `\n📦 Sisa Box: ${user[boxType]} ${boxType}`;

        return ryzu.sendMessage(
            from,
            {
                text,
                contextInfo: {
                    externalAdReply: {
                        title: `OPENED: ${boxType.toUpperCase()} BOX`,
                        body: jackpot
                            ? "🔥 JACKPOT! RNG DEWA!"
                            : "Cek .inv buat lihat itemmu",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            },
            { quoted: msg }
        );
    }
};
