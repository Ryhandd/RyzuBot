module.exports = {
    name: "invest",
    alias: ["investasi"],
    execute: async ({ sender, args, reply, funcs }) => {
        const user = global.rpg[sender];
        if (!args[0] || args[0] === 'list') {
            return reply(`📈 *INVEST LIST*\n\n1. Bank (Profit 5% | 1 Jam)\n2. Crypto (Profit 20% | 1 Jam)\n3. Startup (Profit 100% | 24 Jam)\n\nContoh: .invest 1 5000`);
        }

        const type = parseInt(args[0]);
        const amount = parseInt(args[1]);
        const invData = [
            { n: "Bank", r: 0.05, t: 3600000 },
            { n: "Crypto", r: 0.2, t: 3600000 },
            { n: "Startup", r: 1.0, t: 86400000 }
        ];

        if (!invData[type - 1]) return reply("❌ Tipe investasi tidak valid.");
        if (isNaN(amount) || amount < 100) return reply("❌ Minimal investasi 100 money.");
        if (user.money < amount) return reply("❌ Money kamu tidak cukup.");

        user.money -= amount;
        user.investasi.push({
            name: invData[type - 1].n,
            amount: amount,
            return: Math.floor(amount + (amount * invData[type - 1].r)),
            claimTime: Date.now() + invData[type - 1].t
        });

        funcs.saveRPG();
        return reply(`✅ Berhasil invest 💰 ${amount.toLocaleString()} di ${invData[type - 1].n}.\nSilakan cek di .money dan tarik jika sudah cair.`);
    }
};