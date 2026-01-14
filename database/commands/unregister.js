<<<<<<< HEAD
module.exports = {
    name: "unreg",
    alias: ["unregister", "bataldaftar"],
    desc: "Membatalkan registrasi nama (Harta tetap aman)",
    async execute(ctx) {
        const { user, reply, funcs } = ctx;

        if (!user.registered) return reply("Lu emang belum daftar, Bro. Mau unreg apanya? 😂");

        const cooldown = 3600000; // 1 jam dalam milidetik
        if (user.lastUnreg && Date.now() - user.lastUnreg < cooldown) {
            let sisa = cooldown - (Date.now() - user.lastUnreg);
            let m = Math.floor(sisa / 60000);
            let s = Math.floor((sisa % 60000) / 1000);
            return reply(`⏳ Sabar Bro! Lu baru aja unreg. Tunggu *${m}m ${s}s* lagi kalau mau unreg/regis ulang.`);
        }

        // Proses Unreg
        const oldName = user.name;
        user.registered = false;
        user.name = "";
        user.regTime = 0;

        user.lastUnreg = Date.now();

        funcs.saveRPG();

        reply(`✅ *UNREGISTER BERHASIL*\n\nNama lama *${oldName}* telah dihapus.\n\n⚠️ *Catatan:* History claim harian/mingguan lu tetep kesimpen di nomor ini, jadi gak bisa di-reset pake unreg.`);
    }
=======
module.exports = {
    name: "unreg",
    alias: ["unregister", "bataldaftar"],
    desc: "Membatalkan registrasi nama (Harta tetap aman)",
    async execute(ctx) {
        const { user, reply, funcs } = ctx;

        if (!user.registered) return reply("Lu emang belum daftar, Bro. Mau unreg apanya? 😂");

        const cooldown = 3600000; // 1 jam dalam milidetik
        if (user.lastUnreg && Date.now() - user.lastUnreg < cooldown) {
            let sisa = cooldown - (Date.now() - user.lastUnreg);
            let m = Math.floor(sisa / 60000);
            let s = Math.floor((sisa % 60000) / 1000);
            return reply(`⏳ Sabar Bro! Lu baru aja unreg. Tunggu *${m}m ${s}s* lagi kalau mau unreg/regis ulang.`);
        }

        // Proses Unreg
        const oldName = user.name;
        user.registered = false;
        user.name = "";
        user.regTime = 0;

        user.lastUnreg = Date.now();

        funcs.saveRPG();

        reply(`✅ *UNREGISTER BERHASIL*\n\nNama lama *${oldName}* telah dihapus.\n\n⚠️ *Catatan:* History claim harian/mingguan lu tetep kesimpen di nomor ini, jadi gak bisa di-reset pake unreg.`);
    }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
}