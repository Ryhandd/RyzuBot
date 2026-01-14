<<<<<<< HEAD
const axios = require("axios");

module.exports = {
    name: "pinterest",
    alias: ["pin"],
    execute: async ({ ryzu, from, msg, q, reply, prefix, command }) => {

        if (!q)
            return reply(`Mau cari gambar apa?\nContoh: ${prefix + command} anime aesthetic`);

        reply("🔍 Sedang mencari gambar...");

        try {
            const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q + " site:pinterest.com")}&form=HDRSC2&first=1&tsc=ImageBasicHover`;

            const res = await axios.get(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            const matches = [...res.data.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)];
            if (!matches.length)
                return reply("❌ Gambar tidak ditemukan.");

            const images = matches.map(v => v[1]);
            const random = images[Math.floor(Math.random() * images.length)];

            await ryzu.sendMessage(
                from,
                {
                    image: { url: random },
                    caption: `📌 Pinterest Result: *${q}*`
                },
                { quoted: msg }
            );

        } catch (e) {
            console.error("PIN ERROR:", e);
            reply("❌ Gagal mengambil gambar.");
        }
    }
};
=======
const axios = require("axios");

module.exports = {
    name: "pinterest",
    alias: ["pin"],
    execute: async ({ ryzu, from, msg, q, reply, prefix, command }) => {

        if (!q)
            return reply(`Mau cari gambar apa?\nContoh: ${prefix + command} anime aesthetic`);

        reply("🔍 Sedang mencari gambar...");

        try {
            const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q + " site:pinterest.com")}&form=HDRSC2&first=1&tsc=ImageBasicHover`;

            const res = await axios.get(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            const matches = [...res.data.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)];
            if (!matches.length)
                return reply("❌ Gambar tidak ditemukan.");

            const images = matches.map(v => v[1]);
            const random = images[Math.floor(Math.random() * images.length)];

            await ryzu.sendMessage(
                from,
                {
                    image: { url: random },
                    caption: `📌 Pinterest Result: *${q}*`
                },
                { quoted: msg }
            );

        } catch (e) {
            console.error("PIN ERROR:", e);
            reply("❌ Gagal mengambil gambar.");
        }
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
