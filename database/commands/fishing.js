const buff = require('../../lib/equipmentBuff');
const dura = require('../../lib/durability');
const { safeNum, addExp } = require('../../lib/rpgUtils');

module.exports = {
    name: "fishing",
    alias: ["mancing"],
    execute: async ({ sender, reply, funcs }) => {

        const user = global.rpg[sender];

        // ===== SANITIZE =====
        user.umpan = safeNum(user.umpan);
        user.exp = safeNum(user.exp);

        user.ikan = safeNum(user.ikan);
        user.ikan_lele = safeNum(user.ikan_lele);
        user.ikan_mas = safeNum(user.ikan_mas);
        user.ikan_paus = safeNum(user.ikan_paus);
        user.kepiting = safeNum(user.kepiting);

        user.lastFishing = safeNum(user.lastFishing);

        user.rod = 1;
        user.durability = user.durability || {};
        user.durability.rod = 100;

        // ===== REQUIREMENTS =====
        if (!user.rod)
            return reply("❌ Kamu tidak punya rod. Create dulu di .craft");

        if (user.umpan < 1)
            return reply("❌ Umpan habis. Beli dulu di .shop");

        // ===== COOLDOWN =====
        const cooldown = 600000;
        const sisa = cooldown - (Date.now() - user.lastFishing);

        if (sisa > 0) {
            const menit = Math.floor(sisa / 60000);
            const detik = Math.floor((sisa % 60000) / 1000);
            return reply(
                `⏳ Tunggu *${menit} menit ${detik} detik* lagi sebelum mancing.`
            );
        }

        user.lastFishing = Date.now();

        // ===== DURABILITY =====
        if (user.rod && user.durability?.rod > 0) {
            user.durability.rod -= dura.lose(user.rod, "rod");
            if (user.durability.rod < 0)
                user.durability.rod = 0;
        }

        // ===== KURANGI UMPAN =====
        user.umpan -= 1;

        // ===== BASE LOOT =====
        let ikanBiasa = Math.floor(Math.random() * 5) + 2;
        let lele = 0, kepiting = 0, ikanMas = 0, paus = 0;

        if (Math.random() < 0.4)
            lele = Math.floor(Math.random() * 3) + 1;

        if (Math.random() < 0.25)
            kepiting = Math.floor(Math.random() * 2) + 1;

        if (Math.random() < 0.1)
            ikanMas = 1;

        if (Math.random() < 0.005)
            paus = 1;

        // ===== BUFF =====
        const rodBonus = safeNum(buff.rodFishingBonus(user.rod), 1);

        ikanBiasa = Math.floor(ikanBiasa * rodBonus);
        lele = Math.floor(lele * rodBonus);
        kepiting = Math.floor(kepiting * rodBonus);
        ikanMas = Math.floor(ikanMas * rodBonus);
        paus = Math.floor(paus * rodBonus);

        // ===== EXP =====
        let exp = Math.floor(Math.random() * 80) + 100;

        if (user.pet_dragon)
            exp = Math.floor(exp * 1.05);

        // ===== UPDATE USER =====
        user.ikan += ikanBiasa;
        user.ikan_lele += lele;
        user.kepiting += kepiting;
        user.ikan_mas += ikanMas;
        user.ikan_paus += paus;

        addExp(user, exp);

        await funcs.saveRPG(sender);
        const up = funcs.cekLevel(sender);

        // ===== PESAN =====
        let hasil = `🎣 *HASIL MANCING*\n\n`;
        hasil += `🐟 Ikan Biasa: +${ikanBiasa}\n`;
        if (lele) hasil += `🐟 Lele: +${lele}\n`;
        if (kepiting) hasil += `🦀 Kepiting: +${kepiting}\n`;
        if (ikanMas) hasil += `🐠 Ikan Mas: +${ikanMas}\n`;
        if (paus) hasil += `🐳 Ikan Paus: +${paus}\n`;
        hasil += `\n✨ EXP: +${exp.toLocaleString('id-ID')}`;

        if (up)
            hasil += `\n\n🎉 *LEVEL UP!*`;

        if (user.fishing_charm || user.pet_dragon) {
            hasil += `\n\n🔮 *BUFF AKTIF*`;
            if (user.fishing_charm)
                hasil += `\n🎣 Fishing Charm (+10% hasil)`;
            if (user.pet_dragon)
                hasil += `\n🐉 Pet Dragon (+5% EXP)`;
        }

        return reply(hasil);
    }
};
