const { safeNum, addMoney } = require('../../lib/rpgUtils')
module.exports = {
    name: "transfer",
    alias: ["tf"],
    execute: async ({ sender, args, reply, funcs, mentionUser, quotedUser }) => {
        const user = global.rpg[sender];
        if (!user) return reply("❌ Kamu belum punya data RPG. Ketik *.daftar nama* dulu.")

        const target = quotedUser || mentionUser[0];
        if (!target) return reply("❌ Tag atau reply orangnya.");
        if (target === sender) return reply("❌ Tidak bisa transfer ke diri sendiri.");

        funcs.checkUser(target);
        const to = global.rpg[target];
        if (!to) return reply("❌ Data penerima tidak ditemukan.");

        const item = args[0]?.toLowerCase();
        const amount = safeNum(args[1]);
        const canTf = [
            'money', 'diamond', 'emas', 'besi',
            'batu', 'kayu', 'umpan', 'potion',
            'common', 'uncommon', 'mythic', 'legendary'
        ];
        if (!canTf.includes(item) || amount < 1)
            return reply(
                "❌ Format salah.\n" +
                "Contoh: .tf money 1000 @tag"
            );

        // ===== SANITIZE BOTH =====
        user[item] = safeNum(user[item]);
        to[item] = safeNum(to[item]);
        if (user[item] < amount)
            return reply(`❌ ${item} kamu tidak cukup!`);

        // ===== TRANSFER =====
        if (item === 'money') {
            addMoney(user, -amount);
            addMoney(to, amount);
        } else {
            user[item] -= amount;
            to[item] += amount;
        }

        // Simpan KEDUA sisi — sebelumnya penerima tidak pernah tersimpan
        // sehingga saldo hilang setelah restart (bug sinkronisasi).
        await Promise.all([
            funcs.saveRPG(sender),
            funcs.saveRPG(target)
        ]);

        return reply(
            `✅ *TRANSFER BERHASIL*\n\n` +
            `📦 Item: ${item}\n` +
            `🔢 Jumlah: ${amount.toLocaleString('id-ID')}\n` +
            `👤 Ke: @${target.split('@')[0]}`
        );
    }
};