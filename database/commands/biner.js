module.exports = {
  name: "biner",
  alias: ["binary"],
  execute: async ({ reply, q, prefix, command }) => {

    if (!q) {
      return reply(`Contoh:
${prefix + command} halo
${prefix + command} 01101000 01100001 01101100 01101111`);
    }

    try {
      const isBinary = /^[01\s]+$/.test(q);

      if (isBinary) {
        const text = q.split(" ")
          .map(bin => String.fromCharCode(parseInt(bin, 2)))
          .join("");

        return reply(`📥 Biner ke Teks:
${text}`);
      } else {
        const binary = q.split("")
          .map(char => char.charCodeAt(0).toString(2).padStart(8, "0"))
          .join(" ");

        return reply(`📤 Teks ke Biner:
${binary}`);
      }

    } catch (err) {
      console.error(err);
      reply("❌ Error pas convert. Input lu aneh.");
    }
  }
};