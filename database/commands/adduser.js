<<<<<<< HEAD
module.exports = {
    name: "adduser",
    execute: async ({
        ryzu, from, q, reply,
        isGroup, isAdmin
    }) => {

        if (!isGroup) return reply("❌ Khusus grup.");
        if (!isAdmin) return reply("❌ Admin only.");
        if (!q) return reply("❌ Masukkan nomor.");

        let num = q.replace(/\D/g, "");

        if (num.startsWith("0")) {
            num = "62" + num.slice(1);
        }

        const jid = num + "@s.whatsapp.net";

        try {
            await ryzu.groupParticipantsUpdate(from, [jid], "add");
            reply("✅ User berhasil ditambahkan.");
        } catch (err) {
            console.error(err);
            reply("❌ Gagal add user.");
        }
    }
};
=======
module.exports = {
    name: "adduser",
    execute: async ({
        ryzu, from, q, reply,
        isGroup, isAdmin
    }) => {

        if (!isGroup) return reply("❌ Khusus grup.");
        if (!isAdmin) return reply("❌ Admin only.");
        if (!q) return reply("❌ Masukkan nomor.");

        let num = q.replace(/\D/g, "");

        if (num.startsWith("0")) {
            num = "62" + num.slice(1);
        }

        const jid = num + "@s.whatsapp.net";

        try {
            await ryzu.groupParticipantsUpdate(from, [jid], "add");
            reply("✅ User berhasil ditambahkan.");
        } catch (err) {
            console.error(err);
            reply("❌ Gagal add user.");
        }
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
