<<<<<<< HEAD
module.exports = {
    name: "listpremium",
    alias: ["premiumlist"],
    desc: "Lihat daftar user premium",
    async execute(ctx) {
        const { funcs, reply } = ctx;
        
        let users = Object.entries(global.rpg).filter(([id, data]) => data.premium);
        if (users.length === 0) return reply("Belum ada user premium, sedih banget. 🥲");

        let teks = `💎 *RYZU PREMIUM USERS* 💎\n\n`;
        let skrg = Date.now();

        users.forEach(([id, data], i) => {
            let sisa;
            if (data.premiumTime === -1) {
                sisa = "PERMANEN";
            } else {
                let sisaWaktu = data.premiumTime - skrg;
                if (sisaWaktu <= 0) {
                    sisa = "KADALUWARSA";
                } else {
                    // Hitung sisa waktu (Hari Jam Menit Detik)
                    let d = Math.floor(sisaWaktu / (1000 * 60 * 60 * 24));
                    let h = Math.floor((sisaWaktu % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    let m = Math.floor((sisaWaktu % (1000 * 60 * 60)) / (1000 * 60));
                    let s = Math.floor((sisaWaktu % (1000 * 60)) / 1000);
                    sisa = `${d}h ${h}j ${m}m ${s}d`;
                }
            }
            let nama = data.name || `@${id.split('@')[0]}`;
            teks += `${i + 1}. ${nama}\n   └ Durasi: ${sisa}\n`;
        });

        reply(teks);
    }
=======
module.exports = {
    name: "listpremium",
    alias: ["premiumlist"],
    desc: "Lihat daftar user premium",
    async execute(ctx) {
        const { funcs, reply } = ctx;
        
        let users = Object.entries(global.rpg).filter(([id, data]) => data.premium);
        if (users.length === 0) return reply("Belum ada user premium, sedih banget. 🥲");

        let teks = `💎 *RYZU PREMIUM USERS* 💎\n\n`;
        let skrg = Date.now();

        users.forEach(([id, data], i) => {
            let sisa;
            if (data.premiumTime === -1) {
                sisa = "PERMANEN";
            } else {
                let sisaWaktu = data.premiumTime - skrg;
                if (sisaWaktu <= 0) {
                    sisa = "KADALUWARSA";
                } else {
                    // Hitung sisa waktu (Hari Jam Menit Detik)
                    let d = Math.floor(sisaWaktu / (1000 * 60 * 60 * 24));
                    let h = Math.floor((sisaWaktu % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    let m = Math.floor((sisaWaktu % (1000 * 60 * 60)) / (1000 * 60));
                    let s = Math.floor((sisaWaktu % (1000 * 60)) / 1000);
                    sisa = `${d}h ${h}j ${m}m ${s}d`;
                }
            }
            let nama = data.name || `@${id.split('@')[0]}`;
            teks += `${i + 1}. ${nama}\n   └ Durasi: ${sisa}\n`;
        });

        reply(teks);
    }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
};