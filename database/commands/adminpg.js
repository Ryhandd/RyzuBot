const { safeNum, addMoney, addExp, MAX_SAFE } = require('../../lib/rpgUtils');

module.exports = {
    name: "adminrpg",
    alias: [
        "addmoney", "addexp", "addlevel",
        "setmoney", "setexp", "setlevel",
        "setpremium", "delpremium",
        "setafk", "delafk"
    ],
    execute: async ({ isCreator, command, args, reply, funcs, mentionUser, quotedUser, ryzu, from, msg }) => {

        if (!isCreator)
            return reply("❌ Fitur khusus Owner.");

        const target = quotedUser || mentionUser[0];
        if (!target)
            return reply("❌ Tag atau reply orangnya.");

        funcs.checkUser(target);
        const tUser = global.rpg[target];

        // ===== SANITIZE BASIC =====
        tUser.money = safeNum(tUser.money);
        tUser.exp = safeNum(tUser.exp);
        tUser.level = safeNum(tUser.level);

        // ===== PREMIUM =====
        if (command === "setpremium") {
            const durasi = args.find(
                a => a.toLowerCase() === "permanen" || Number.isFinite(Number(a))
            );

            if (!durasi)
                return reply(
                    "Masukkan durasi!\n" +
                    "*.setpremium @user 30*\n" +
                    "*.setpremium @user permanen*"
                );

            if (durasi.toLowerCase() === "permanen") {
                tUser.premium = true;
                tUser.premiumTime = -1;
                await funcs.saveRPG(target);
                return reply(`✅ @${target.split('@')[0]} Premium Permanen!`);
            }

            const hari = safeNum(durasi);
            const ms = hari * 24 * 60 * 60 * 1000;
            const now = Date.now();

            if (tUser.premiumTime > now && tUser.premiumTime !== -1)
                tUser.premiumTime += ms;
            else
                tUser.premiumTime = now + ms;

            tUser.premium = true;

            const tgl = new Date(tUser.premiumTime).toLocaleString('id-ID');
            await funcs.saveRPG(target);
            return reply(
                `✅ @${target.split('@')[0]} Premium ${hari} hari.\n` +
                `Berakhir: ${tgl}`
            );
        }

        if (command === "delpremium") {
            tUser.premium = false;
            tUser.premiumTime = 0;
            await funcs.saveRPG(target);
            return reply(`❌ Premium @${target.split('@')[0]} dicabut.`);
        }

        // ===== AFK =====
        if (command === "setafk") {
            const jamArg = args.find(a => Number.isFinite(Number(a)));
            const jam = jamArg ? safeNum(jamArg) : 1;

            if (jam <= 0)
                return reply("❌ Durasi AFK tidak valid.");

            const ms = jam * 60 * 60 * 1000;

            tUser.afk = Date.now() - ms;
            tUser.afkReason = args.slice(jamArg ? 1 : 0).join(" ") || "AFK";

            await funcs.saveRPG(target);

            ryzu.sendMessage(from, {
                text:
                    `😴 @${target.split('@')[0]} diset AFK.\n` +
                    `⏱️ Durasi: ${jam} jam\n` +
                    `📄 Alasan: ${tUser.afkReason}`,
                mentions: [target]
            }, { quoted: msg });

            return;
        }

        if (command === "delafk") {
            if (!tUser.afk)
                return reply("❌ User tidak sedang AFK.");

            const lama = Date.now() - tUser.afk;
            const waktu = funcs.runtime(lama / 1000);

            tUser.afk = 0;
            tUser.afkReason = "";

            await funcs.saveRPG(target);

            ryzu.sendMessage(from, {
                text:
                    `✨ @${target.split('@')[0]} kembali online!\n` +
                    `Berhenti AFK setelah: ${waktu}`,
                mentions: [target]
            }, { quoted: msg });

            return;
        }

        // ===== VALUE =====
        const valueArg = args.find(a => Number.isFinite(Number(a)));
        const value = safeNum(valueArg);

        if (!valueArg)
            return reply("❌ Masukkan angka yang valid!");

        if (value < 0)
            return reply("❌ Nilai tidak valid.");

        const type = command.replace("add", "").replace("set", "");

        // ===== ADD =====
        if (command.startsWith("add")) {

            if (type === "money") {
                addMoney(tUser, value);
            }
            else if (type === "exp") {
                addExp(tUser, value);
                funcs.cekLevel(target);
            }
            else if (type === "level") {
                tUser.level += value;
            }
        }

        // ===== SET =====
        else {

            if (type === "money") {
                tUser.money = Math.min(value, MAX_SAFE);
            }
            else if (type === "exp") {
                tUser.exp = value;
            }
            else if (type === "level") {
                tUser.level = value;
            }
        }

        await funcs.saveRPG(target);

        return reply(
            `✅ *ADMIN RPG*\n\n` +
            `📌 Command: ${command}\n` +
            `🔢 Value: ${value.toLocaleString('id-ID')}\n` +
            `👤 Target: @${target.split('@')[0]}`
        );
    }
};