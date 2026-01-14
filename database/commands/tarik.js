module.exports = {
    name: "tarik",
    alias: ["wd"],
    execute: async ({ sender, args, reply, funcs }) => {
        const user = global.rpg[sender];
        if (!user.investasi || user.investasi.length === 0) return reply("❌ Tidak ada investasi aktif.");
        
        let now = Date.now();
        let claimable = user.investasi.filter(inv => now >= inv.claimTime);
        if (claimable.length === 0) return reply("⏳ Belum ada yang bisa dicairkan.");

        let totalTersedia = claimable.reduce((acc, curr) => acc + curr.return, 0);
        let jumlahTarik = 0;

        if (args[0] === "all") {
            jumlahTarik = totalTersedia;
            user.investasi = user.investasi.filter(inv => now < inv.claimTime);
        } else if (!isNaN(parseInt(args[0]))) {
            jumlahTarik = parseInt(args[0]);
            if (jumlahTarik > totalTersedia) return reply("❌ Saldo belum cukup.");
            let sisaRequest = jumlahTarik;
            for (let inv of user.investasi) {
                if (now >= inv.claimTime && sisaRequest > 0) {
                    let diambil = Math.min(inv.return, sisaRequest);
                    inv.return -= diambil;
                    sisaRequest -= diambil;
                }
            }
            user.investasi = user.investasi.filter(inv => inv.return > 0 || now < inv.claimTime);
        } else {
            jumlahTarik = claimable[0].return;
            user.investasi.splice(user.investasi.indexOf(claimable[0]), 1);
        }

        user.money += jumlahTarik;
        funcs.saveRPG();
        return reply(`💰 Berhasil tarik 💰 ${jumlahTarik.toLocaleString()} ke dompet!`);
    }
};