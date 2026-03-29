module.exports = {
    name:"base64",

    execute: async ({ command, q, reply }) => {
        if (!q) return reply("Contoh: .encode halo");

        try {
        if (command === "encode") {
            const encoded = Buffer.from(q).toString("base64");
            return reply(encoded);
        } else {
            const decoded = Buffer.from(q, "base64").toString("utf-8");
            return reply(decoded);
        }
        } catch {
        return reply("❌ Error base64.");
        }
    }
};