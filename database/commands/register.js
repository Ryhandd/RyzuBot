module.exports = {
    name: "register",
    alias: ["daftar", "reg"],
    desc: "Daftar untuk bisa menggunakan fitur bot",
    async execute(ctx) {
        const { m, args, reply, user, funcs } = ctx;
        
        if (user.registered) return reply("Kamu sudah terdaftar sebelumnya");
        
        if (!args[0]) return reply("Format salah! Contoh: *.register Rayhand*");
        
        let nama = args.join(" ");
        if (nama.length > 20) return reply("Nama kepanjangan, maksimal 20 karakter!");

        user.name = nama;
        user.registered = true;
        user.regTime = Date.now();
        user.money += 10000;

        reply(`✅ *PENDAFTARAN BERHASIL!*\n\n• Nama: ${nama}\n• Hadiah: 10000 Money\n• Limit: ${user.limit}\n\nSekarang lu udah bisa akses semua fitur bot!`);
        
        await funcs.saveRPG(sender);
    }
}