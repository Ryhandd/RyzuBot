<<<<<<< HEAD
const { safeNum } = require('../../lib/rpgUtils');

module.exports = {
    name: "kolam",
    execute: async ({ sender, reply }) => {

        const u = global.rpg[sender];

        // ===== SANITIZE (DISPLAY ONLY) =====
        const ikan = safeNum(u.ikan);
        const lele = safeNum(u.ikan_lele);
        const mas = safeNum(u.ikan_mas);
        const paus = safeNum(u.ikan_paus);
        const kepiting = safeNum(u.kepiting);

        let t = `🐟 *KOLAM IKAN*\n\n`;
        t += `🐟 Ikan: ${ikan.toLocaleString('id-ID')}\n`;
        t += `🐟 Lele: ${lele.toLocaleString('id-ID')}\n`;
        t += `🐠 Ikan Mas: ${mas.toLocaleString('id-ID')}\n`;
        t += `🐳 Ikan Paus: ${paus.toLocaleString('id-ID')}\n`;
        t += `🦀 Kepiting: ${kepiting.toLocaleString('id-ID')}`;

        reply(t);
    }
};
=======
const { safeNum } = require('../../lib/rpgUtils');

module.exports = {
    name: "kolam",
    execute: async ({ sender, reply }) => {

        const u = global.rpg[sender];

        // ===== SANITIZE (DISPLAY ONLY) =====
        const ikan = safeNum(u.ikan);
        const lele = safeNum(u.ikan_lele);
        const mas = safeNum(u.ikan_mas);
        const paus = safeNum(u.ikan_paus);
        const kepiting = safeNum(u.kepiting);

        let t = `🐟 *KOLAM IKAN*\n\n`;
        t += `🐟 Ikan: ${ikan.toLocaleString('id-ID')}\n`;
        t += `🐟 Lele: ${lele.toLocaleString('id-ID')}\n`;
        t += `🐠 Ikan Mas: ${mas.toLocaleString('id-ID')}\n`;
        t += `🐳 Ikan Paus: ${paus.toLocaleString('id-ID')}\n`;
        t += `🦀 Kepiting: ${kepiting.toLocaleString('id-ID')}`;

        reply(t);
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
