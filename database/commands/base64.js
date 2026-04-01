module.exports = {
    name: "base64",
    alias: ["encode", "decode"], 

    execute: async ({ command, q, reply }) => {
        if (!q) return reply(`Contoh penggunaan:\n.encode teks\n.decode dGVrcw==`);

        try {
            if (command === "encode") {
                const encoded = Buffer.from(q).toString("base64");
                return reply(encoded);
            } 
            
            if (command === "decode") {
                const decoded = Buffer.from(q, "base64").toString("utf-8");
                return reply(decoded);
            }
        } catch (e) {
            return reply("❌ Terjadi kesalahan: Pastikan format base64 benar.");
        }
    }
};