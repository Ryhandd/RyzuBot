const axios = require("axios");

// Map single/plural categories to match API paths
const categoryMap = {
  "character": "characters",
  "characters": "characters",
  "weapon": "weapons",
  "weapons": "weapons",
  "artifact": "artifacts",
  "artifacts": "artifacts",
  "boss": "boss/weekly-boss",
  "bosses": "boss/weekly-boss",
  "weekly-boss": "boss/weekly-boss",
  "weeklyboss": "boss/weekly-boss",
  "consumable": "consumables",
  "consumables": "consumables",
  "domain": "domains",
  "domains": "domains",
  "element": "elements",
  "elements": "elements",
  "enemy": "enemies",
  "enemies": "enemies",
  "material": "materials",
  "materials": "materials",
  "nation": "nations",
  "nations": "nations"
};

// Search across categories to find the entity and its category
async function findEntity(id) {
  const categories = ["characters", "weapons", "artifacts", "boss/weekly-boss", "enemies", "nations", "elements", "domains"];
  for (const cat of categories) {
    try {
      const url = `https://genshin.jmp.blue/${cat}/${id}`;
      const res = await axios.get(url);
      return { category: cat, data: res.data };
    } catch (e) {
      // Continue searching
    }
  }
  return null;
}

// Custom formatters for detailed text display
function formatDetails(category, data, id) {
  if (category === "characters") {
    return `👤 *KARAKTER GENSHIN IMPACT*

• *Nama:* ${data.name} (${data.title || "N/A"})
• *Rarity:* ${"⭐".repeat(data.rarity || 5)}
• *Vision:* ${data.vision}
• *Senjata:* ${data.weapon}
• *Bangsa:* ${data.nation}
• *Afiliasi:* ${data.affiliation}
• *Ulang Tahun:* ${data.birthday ? data.birthday.replace(/^\d{4}-/, "") : "N/A"}
• *Konstelasi:* ${data.constellation}
• *Deskripsi:* ${data.description || "-"}`;
  }

  if (category === "weapons") {
    return `⚔️ *SENJATA GENSHIN IMPACT*

• *Nama:* ${data.name}
• *Tipe:* ${data.type}
• *Rarity:* ${"⭐".repeat(data.rarity || 1)}
• *Base ATK:* ${data.baseAttack}
• *Sub Stat:* ${data.subStat || "-"}
• *Dapatkan dari:* ${data.location}
• *Pasif:* ${data.passiveName || "-"}
• *Deskripsi Pasif:* ${data.passiveDesc || "-"}`;
  }

  if (category === "artifacts") {
    return `🛡️ *ARTIFAT GENSHIN IMPACT*

• *Nama:* ${data.name}
• *Max Rarity:* ${"⭐".repeat(data.max_rarity || 1)}
• *2-Piece Bonus:* ${data["2-piece_bonus"] || "-"}
• *4-Piece Bonus:* ${data["4-piece_bonus"] || "-"}`;
  }

  if (category === "boss/weekly-boss") {
    return `👾 *WEEKLY BOSS GENSHIN IMPACT*

• *Nama:* ${data.name}
• *Deskripsi:* ${data.description || "-"}`;
  }

  if (category === "enemies") {
    return `👹 *MUSUH GENSHIN IMPACT*

• *Nama:* ${data.name}
• *Tipe:* ${data.type}
• *Family:* ${data.family || "-"}
• *Fraksi:* ${data.faction || "-"}
• *Wilayah:* ${data.region}
• *Elemen:* ${data.elements ? data.elements.join(", ") : "-"}
• *Deskripsi:* ${data.description !== "N/A" ? data.description : (data.descriptions && data.descriptions[0] ? data.descriptions[0].description : "-")}`;
  }

  if (category === "nations") {
    return `🌍 *WILAYAH / BANGSA GENSHIN IMPACT*

• *Nama:* ${data.name}
• *Elemen:* ${data.element}
• *Archon:* ${data.archon}
• *Pengendali:* ${data.controllingEntity}`;
  }

  if (category === "elements") {
    let text = `🌀 *ELEMEN GENSHIN IMPACT*\n\n• *Nama:* ${data.name}\n• *Key:* ${data.key}\n• *Reaksi:*`;
    if (data.reactions && data.reactions.length > 0) {
      data.reactions.forEach(r => {
        text += `\n  - *${r.name}:* ${r.description} (${r.elements ? r.elements.join(" + ") : ""})`;
      });
    } else {
      text += " -";
    }
    return text;
  }

  if (category === "domains") {
    return `🏰 *DOMAIN GENSHIN IMPACT*

• *Nama:* ${data.name}
• *Tipe:* ${data.type}
• *Lokasi:* ${data.location}
• *Bangsa:* ${data.nation}
• *Rekomendasi Elemen:* ${data.recommendedElements ? data.recommendedElements.join(", ") : "-"}
• *Deskripsi:* ${data.description || "-"}`;
  }

  // Fallback formatter for generic JSON objects
  let text = `ℹ️ *DETAIL GENSHIN IMPACT*\n\n• *Nama:* ${data.name || id}\n• *Kategori:* ${category}\n`;
  for (const [key, val] of Object.entries(data)) {
    if (key === "id" || key === "name") continue;
    if (typeof val === "string" || typeof val === "number") {
      text += `• *${key.charAt(0).toUpperCase() + key.slice(1)}:* ${val}\n`;
    } else if (Array.isArray(val) && val.every(item => typeof item === "string")) {
      text += `• *${key.charAt(0).toUpperCase() + key.slice(1)}:* ${val.join(", ")}\n`;
    }
  }
  return text;
}

module.exports = {
  name: "genshin",
  alias: ["gi"],
  execute: async ({ ryzu, from, args, msg, reply, prefix }) => {
    try {
      if (args.length === 0) {
        // Show main help menu
        const menuText = `🌟 *GENSHIN IMPACT DATABASE* 🌟

Daftar kategori yang tersedia:
• *characters* (atau *character*)
• *weapons* (atau *weapon*)
• *artifacts* (atau *artifact*)
• *boss* (weekly bosses)
• *enemies* (atau *enemy*)
• *nations* (atau *nation*)
• *elements* (atau *element*)
• *domains* (atau *domain*)
• *materials* (atau *material*)
• *consumables* (atau *consumable*)

📖 *Cara Penggunaan:*
1. *Daftar Item:* Ketik \`${prefix}genshin <kategori>\`
   _Contoh: \`${prefix}genshin characters\`_
2. *Detail Item:* Ketik \`${prefix}genshin <nama_item>\`
   _Contoh: \`${prefix}genshin arlecchino\`_
3. *Ambil Gambar:* Ketik \`${prefix}genshin <nama_item> <jenis_gambar>\`
   _Contoh: \`${prefix}genshin arlecchino card\`_`;
        return reply(menuText);
      }

      // Check if first arg is a category
      const arg0 = args[0].toLowerCase();
      const mappedCategory = categoryMap[arg0];

      if (mappedCategory) {
        // If there's a second argument, e.g. .genshin characters arlecchino [card]
        if (args[1]) {
          const itemId = args[1].toLowerCase();
          const imageType = args.slice(2).join("-").toLowerCase();

          if (imageType) {
            // User requested an image: .genshin characters arlecchino card
            await reply(`⏳ Mengunduh gambar *${imageType}* untuk *${itemId}*...`);
            const imageUrl = `https://genshin.jmp.blue/${mappedCategory}/${itemId}/${imageType}`;
            try {
              const resImage = await axios.get(imageUrl, { responseType: "arraybuffer" });
              const buffer = Buffer.from(resImage.data, "binary");
              return await ryzu.sendMessage(from, { 
                image: buffer, 
                caption: `🖼️ *GENSHIN IMAGE*\n\n• Item: ${itemId}\n• Jenis: ${imageType}` 
              }, { quoted: msg });
            } catch (e) {
              return reply(`❌ Gambar jenis *${imageType}* tidak ditemukan untuk *${itemId}*.`);
            }
          } else {
            // User requested details specifying category: .genshin characters arlecchino
            await reply(`⏳ Mengambil detail *${itemId}*...`);
            try {
              const resData = await axios.get(`https://genshin.jmp.blue/${mappedCategory}/${itemId}`);
              const detailsText = formatDetails(mappedCategory, resData.data, itemId);

              // Try to fetch image list if possible
              let imagesListText = "";
              try {
                const resList = await axios.get(`https://genshin.jmp.blue/${mappedCategory}/${itemId}/list`);
                if (resList.data && resList.data.length > 0) {
                  imagesListText = `\n\n🖼️ *GAMBAR YANG TERSEDIA:*\n` + resList.data.map(img => `- \`${img}\``).join("\n") + `\n\n💡 Ketik \`${prefix}genshin ${itemId} <jenis_gambar>\` untuk mendownload gambar.`;
                }
              } catch (_) {
                // Ignore failure of image list
              }

              return reply(detailsText + imagesListText);
            } catch (e) {
              return reply(`❌ Gagal mengambil detail *${itemId}* dari kategori *${arg0}*.`);
            }
          }
        } else {
          // User requested list of elements in category: .genshin characters
          await reply(`⏳ Mengambil daftar item dari kategori *${arg0}*...`);
          try {
            const resList = await axios.get(`https://genshin.jmp.blue/${mappedCategory}`);
            const items = Array.isArray(resList.data) ? resList.data : (resList.data.types || []);
            
            if (items.length === 0) {
              return reply(`❌ Kategori *${arg0}* kosong.`);
            }

            const formattedList = items.map(item => `\`${item}\``).join(", ");
            return reply(`📋 *DAFTAR ITEM DI KATEGORI ${arg0.toUpperCase()}* (${items.length} item):\n\n${formattedList}\n\n💡 Ketik \`${prefix}genshin <nama_item>\` untuk melihat detail.`);
          } catch (e) {
            return reply(`❌ Gagal mengambil daftar item untuk kategori *${arg0}*.`);
          }
        }
      }

      // If first argument is NOT a category, search for it as an item ID
      // e.g. .genshin arlecchino [card]
      const itemId = arg0;
      const imageType = args.slice(1).join("-").toLowerCase();

      await reply(`⏳ Mencari data *${itemId}*...`);
      const entity = await findEntity(itemId);

      if (!entity) {
        return reply(`❌ Item *${itemId}* tidak ditemukan di kategori mana pun. Ketik \`${prefix}genshin\` untuk panduan.`);
      }

      const { category, data } = entity;

      if (imageType) {
        // Fetch image directly since they supplied imageType: .genshin arlecchino card
        await reply(`⏳ Mengunduh gambar *${imageType}* untuk *${itemId}*...`);
        const imageUrl = `https://genshin.jmp.blue/${category}/${itemId}/${imageType}`;
        try {
          const resImage = await axios.get(imageUrl, { responseType: "arraybuffer" });
          const buffer = Buffer.from(resImage.data, "binary");
          return await ryzu.sendMessage(from, { 
            image: buffer, 
            caption: `🖼️ *GENSHIN IMAGE*\n\n• Item: ${itemId}\n• Jenis: ${imageType}` 
          }, { quoted: msg });
        } catch (e) {
          return reply(`❌ Gambar jenis *${imageType}* tidak ditemukan untuk *${itemId}*.`);
        }
      } else {
        // Display details and available images
        const detailsText = formatDetails(category, data, itemId);

        let imagesListText = "";
        try {
          const resList = await axios.get(`https://genshin.jmp.blue/${category}/${itemId}/list`);
          if (resList.data && resList.data.length > 0) {
            imagesListText = `\n\n🖼️ *GAMBAR YANG TERSEDIA:*\n` + resList.data.map(img => `- \`${img}\``).join("\n") + `\n\n💡 Ketik \`${prefix}genshin ${itemId} <jenis_gambar>\` untuk mendownload gambar.`;
          }
        } catch (_) {
          // Ignore if image list does not exist
        }

        return reply(detailsText + imagesListText);
      }

    } catch (e) {
      console.error(e);
      return reply("❌ Terjadi kesalahan saat memproses data Genshin.");
    }
  }
};
