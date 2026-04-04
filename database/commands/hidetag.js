module.exports = {
    name: "hidetag",
    alias: ["h", "ht"],
    execute: async ({ ryzu, from, isGroup, isAdmin, isCreator, participants, q, msg, quoted }) => {
        if (!isGroup) return;
        if (!isAdmin && !isCreator) return;

        const jids = participants.map(v => v.id);

        if (quoted) {
            await ryzu.copyNForward(from, quoted, true, {
                contextInfo: {
                    mentionedJid: jids
                }
            });
        } else {
            await ryzu.sendMessage(from, {
                text: q || '',
                mentions: jids
            }, { quoted: msg });
        }
    }
};