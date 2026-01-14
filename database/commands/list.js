<<<<<<< HEAD
module.exports = {
    name: "list",
    alias: ["members"],
    desc: "Cek status registrasi member grup",
    async execute(ctx) {
        const { participants, reply, funcs } = ctx;
        
        let teks = `📋 *LIST MEMBER GRUP*\n\n`;
        let i = 1;
        for (let p of participants) {
            let jid = p.id;
            funcs.checkUser(jid);
            let u = global.rpg[jid];
            let status = u.registered ? "✅" : "❌";
            let nama = u.name ? u.name : `@${jid.split('@')[0]}`;
            
            teks += `${i++}. ${nama} ${status}\n`;
        }
        
        teks += `\n*Keterangan:* ✅ Terdaftar | ❌ Belum`;
        reply(teks);
    }
=======
module.exports = {
    name: "list",
    alias: ["members"],
    desc: "Cek status registrasi member grup",
    async execute(ctx) {
        const { participants, reply, funcs } = ctx;
        
        let teks = `📋 *LIST MEMBER GRUP*\n\n`;
        let i = 1;
        for (let p of participants) {
            let jid = p.id;
            funcs.checkUser(jid);
            let u = global.rpg[jid];
            let status = u.registered ? "✅" : "❌";
            let nama = u.name ? u.name : `@${jid.split('@')[0]}`;
            
            teks += `${i++}. ${nama} ${status}\n`;
        }
        
        teks += `\n*Keterangan:* ✅ Terdaftar | ❌ Belum`;
        reply(teks);
    }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
};