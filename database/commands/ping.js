module.exports = {
    name: "ping",
    alias: ["p", "speed"],
    execute: async ({ ryzu, from, msg }) => {
        const start = Date.now();
        const { key } = await ryzu.sendMessage(from, { text: "Testing Speed..." }, { quoted: msg });
        const end = Date.now();
        
        await ryzu.sendMessage(from, { 
            text: `🚀 *Pong!!*\nRespon: ${end - start}ms`, 
            edit: key 
        });
    }
};