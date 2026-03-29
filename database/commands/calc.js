module.exports = {
    name: "calc",
    
    execute: async ({ q, reply }) => {
        if (!q) return reply("Contoh: .calc 2+2");

        try {
        const safe = q.replace(/[^0-9+\-*/%.() ]/g, "");
        const result = new Function(`return (${safe})`)();

        return reply(`${safe} = ${result}`);
        } catch {
        return reply("❌ Invalid math.");
        }
    }
};