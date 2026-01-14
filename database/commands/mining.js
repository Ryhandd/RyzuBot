module.exports = {
    name: "mining",
    alias: ["tambang"],
    execute: async ({ sender, reply, funcs }) => {
        const user = global.rpg[sender];
        if (!user.lastMining) user.lastMining = 0;

        // ===== COOLDOWN =====
        const cooldown = 900000; // 15 menit
        const sisa = cooldown - (Date.now() - user.lastMining);

        if (sisa > 0) {
            const menit = Math.floor(sisa / 60000);
            const detik = Math.floor((sisa % 60000) / 1000);
            return reply(
                `⏳ Kamu masih kelelahan.\n` +
                `Tunggu *${menit} menit ${detik} detik* lagi sebelum menambang.`
            );
        }

        // ===== BASE LOOT =====
        let batu = Math.floor(Math.random() * 16) + 10;   // 10–25
        let besi = Math.floor(Math.random() * 11) + 5;    // 5–15
        let emas = Math.floor(Math.random() * 5) + 1;     // 1–5
        let diamond = Math.random() < 0.02 ? 1 : 0;       // 2%

        // ===== GACHA BUFF (MINING) =====
        let miningBonus = 1;
        if (user.mining_charm) miningBonus += 0.10; // +10%

        batu = Math.floor(batu * miningBonus);
        besi = Math.floor(besi * miningBonus);
        emas = Math.floor(emas * miningBonus);

        // ===== MONEY =====
        let moneyBonus =
            batu * 40 +
            besi * 120 +
            emas * 400 +
            (diamond ? 5000 : 0);

        // LIMITED ITEM BONUS (OPTIONAL)
        if (user.golden_emblem)
            moneyBonus = Math.floor(moneyBonus * 1.1); // +10%

        // ===== EXP =====
        let exp = 200 + Math.floor(Math.random() * 100); // 200–299

        // PET DRAGON GLOBAL EXP
        if (user.pet_dragon)
            exp = Math.floor(exp * 1.05); // +5%

        // ===== UPDATE USER =====
        user.batu = (user.batu || 0) + batu;
        user.besi = (user.besi || 0) + besi;
        user.emas = (user.emas || 0) + emas;
        user.diamond = (user.diamond || 0) + diamond;
        user.money = (user.money || 0) + moneyBonus;
        user.exp = (user.exp || 0) + exp;
        user.lastMining = Date.now();

        funcs.saveRPG();
        funcs.cekLevel(sender);

        // ===== MESSAGE =====
        let hasil = `⛏️ *HASIL TAMBANG*\n\n`;
        hasil += `🪨 Batu: +${batu}\n`;
        hasil += `⛓️ Besi: +${besi}\n`;
        hasil += `🪙 Emas: +${emas}\n`;
        if (diamond) hasil += `💎 Diamond: +1\n`;
        hasil += `💰 Money: +${moneyBonus}\n`;
        hasil += `✨ Exp: +${exp}`;

        // INFO BUFF (UX NICE)
        if (user.mining_charm || user.pet_dragon || user.golden_emblem) {
            hasil += `\n\n🔮 *BUFF AKTIF*`;
            if (user.mining_charm) hasil += `\n⛏️ Mining Charm (+10%)`;
            if (user.pet_dragon) hasil += `\n🐉 Pet Dragon (+5% EXP)`;
            if (user.golden_emblem) hasil += `\n🌟 Golden Emblem (+10% Money)`;
        }

        return reply(hasil);
    }
};
