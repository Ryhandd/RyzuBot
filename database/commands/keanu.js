const axios = require("axios");

module.exports = {
  name: "keanu",
  alias: ["keanureeves", "kr"],
  execute: async ({ ryzu, from, args, msg, reply }) => {
    try {
      let width = 300;
      let height = 300;
      let options = "";

      // Parse arguments
      // e.g. .keanu 500 300 --grey --young
      // or .keanu 500x300 -g
      const cleanArgs = args.map(a => a.toLowerCase());

      const dims = cleanArgs.filter(a => /^\d+(x\d+)?$/.test(a));
      const flags = cleanArgs.filter(a => a.startsWith("-"));

      if (dims.length > 0) {
        if (dims[0].includes("x")) {
          const parts = dims[0].split("x");
          width = parseInt(parts[0]) || 300;
          height = parseInt(parts[1]) || 300;
        } else {
          width = parseInt(dims[0]) || 300;
          if (dims[1] && /^\d+$/.test(dims[1])) {
            height = parseInt(dims[1]) || width;
          } else {
            height = width; // square
          }
        }
      }

      // Parse flags
      let isYoung = flags.some(f => f.includes("young") || f.includes("y"));
      let isGrey = flags.some(f => f.includes("grey") || f.includes("gray") || f.includes("g"));

      if (isYoung) options += "y";
      if (isGrey) options += "g";

      // Limit max size to prevent abuse (e.g. max 2000x2000)
      if (width > 2000) width = 2000;
      if (height > 2000) height = 2000;
      if (width < 10) width = 10;
      if (height < 10) height = 10;

      await reply(`⏳ Mengambil gambar Keanu Reeves (${width}x${height}${isYoung ? " • Muda" : ""}${isGrey ? " • Grayscale" : ""})...`);

      // URL placekeanu
      // Format: https://placekeanu.com/[width]/[height]/[options]
      // Or if no height option: https://placekeanu.com/[width]/[options]
      let keanuUrl = `https://placekeanu.com/${width}/${height}`;
      if (options) {
        keanuUrl += `/${options}`;
      }

      // Fetch the image
      const response = await axios.get(keanuUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      await ryzu.sendMessage(from, {
        image: buffer,
        caption: `🎬 *KEANU REEVES PLACEHOLDER*\n\n📏 Ukuran: ${width}x${height}px\n⚙️ Opsi: ${options ? options.toUpperCase() : "Standard"}`
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      return reply("❌ Gagal memproses gambar Keanu Reeves.");
    }
  }
};
