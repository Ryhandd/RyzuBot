module.exports = {
    name: "owner",
    alias: ["own"],
    execute: async ({ ryzu, m }) => {
        const ownerNumber = "628971614687";

        const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:Owner RyzuBot
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD
        `.trim();

        await ryzu.sendMessage(m.chat, {
            contacts: {
                displayName: "Owner Bot",
                contacts: [{ vcard }]
            }
        }, { quoted: m });
    }
};