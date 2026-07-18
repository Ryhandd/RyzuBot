const axios = require('axios')

module.exports = {
  name: "nekosia",
  alias: ["ns", "neko", "foxgirl", "wolfgirl", "maid", "vtuber"],
  execute: async (ctx) => {
    const { ryzu, from, msg, reply, user, isCreator, isPremium, sender, funcs, command, args } = ctx

    // 1. Check if the user is a premium user or creator (sultan)
    const sultan = isPremium || isCreator

    // 2. Handle subcommands (info, get, tags, search)
    const firstArg = args[0]?.toLowerCase()
    
    if (firstArg === 'get' || firstArg === 'info') {
      const imageId = args[1]
      if (!imageId) {
        return reply("❌ Masukkan ID gambar! Contoh: `.ns info 66bc6b7481a59a1cf2c79db5`")
      }
      
      if (!sultan && user.limit <= 0) {
        return reply("❌ Limit lu abis! Beli di *.shop* atau upgrade ke *Premium*.")
      }

      try {
        const res = await axios.get(`https://api.nekosia.cat/api/v1/getImageById/${imageId}`)
        if (res.data && res.data.success) {
          const img = res.data
          const imageUrl = (img.metadata?.original?.size > 5000000 && img.image.compressed?.url)
            ? img.image.compressed.url
            : img.image.original.url
          
          await ryzu.sendMessage(from, {
            image: { url: imageUrl },
            caption: makeCaption(img)
          }, { quoted: msg })

          if (!sultan) {
            user.limit -= 1
            await funcs.saveRPG(sender)
            await reply(`✅ Berhasil! Sisa limit: ${user.limit}`)
          } else {
            await reply("✅ Berhasil!")
          }
        } else {
          reply("❌ Gambar tidak ditemukan.")
        }
      } catch (err) {
        console.error(err)
        const errMsg = err.response?.data?.message || err.message || "Gagal mengambil detail gambar."
        reply(`❌ *Gagal mengambil detail gambar!*\n\nDetail: ${errMsg}`)
      }
      return
    }

    if (firstArg === 'tags' || firstArg === 'search') {
      try {
        const res = await axios.get('https://api.nekosia.cat/api/v1/tags')
        if (res.data && res.data.success) {
          const data = res.data
          const query = args.slice(1).join(' ').toLowerCase().trim()
          
          if (!query) {
            // Show popular/random tags
            const mainCats = [
              'random', 'catgirl', 'foxgirl', 'wolfgirl', 'animal-ears', 'tail', 'cute', 'girl', 'young-girl', 'maid', 'vtuber', 'headphones', 'uniform', 'white-hair', 'blue-hair', 'long-hair', 'blonde', 'blue-eyes'
            ]
            const randomTags = [...data.tags].sort(() => 0.5 - Math.random()).slice(0, 15).join(', ')
            
            const helpTags = `🏷️ *DAFTAR TAG & KATEGORI NEKOSIA* 🏷️
━━━━━━━━━━━━━━━━━━━━
Untuk mencari tag kustom, gunakan:
*.ns tags <keyword>*
Contoh: *.ns tags hair*

📊 *Kategori Utama:*
${mainCats.join(', ')}

🏷️ *Beberapa Tag Random:*
${randomTags}
━━━━━━━━━━━━━━━━━━━━`
            return reply(helpTags)
          }

          const matchedTags = data.tags.filter(t => t.toLowerCase().includes(query))
          const matchedAnime = (data.anime || []).filter(a => a.toLowerCase().includes(query))
          const matchedChars = (data.characters || []).filter(c => c.toLowerCase().includes(query))

          const searchResult = `🔍 *Hasil Pencarian Tag Nekosia* 🔍
Keyword: *${query}*
━━━━━━━━━━━━━━━━━━━━
🏷️ *Tags (${matchedTags.length}):*
${matchedTags.slice(0, 15).join(', ') || '-'}
${matchedTags.length > 15 ? `\n...dan ${matchedTags.length - 15} lainnya` : ''}

📺 *Anime (${matchedAnime.length}):*
${matchedAnime.slice(0, 10).join(', ') || '-'}

👤 *Karakter (${matchedChars.length}):*
${matchedChars.slice(0, 10).join(', ') || '-'}
━━━━━━━━━━━━━━━━━━━━`
          return reply(searchResult)
        } else {
          reply("❌ Gagal memuat daftar tag.")
        }
      } catch (err) {
        console.error(err)
        reply("❌ Terjadi kesalahan saat memuat tag.")
      }
      return
    }

    // 3. Determine default category based on the command used
    let defaultCategory = 'random'
    if (command === 'neko') {
      defaultCategory = 'catgirl'
    } else if (command === 'foxgirl') {
      defaultCategory = 'foxgirl'
    } else if (command === 'wolfgirl') {
      defaultCategory = 'wolfgirl'
    } else if (command === 'maid') {
      defaultCategory = 'maid'
    } else if (command === 'vtuber') {
      defaultCategory = 'vtuber'
    }

    // 4. Parse arguments using smart parser
    const options = parseSmart(args, defaultCategory)

    // If category is nothing, additionalTags is required
    if (options.category === 'nothing' && options.tags.length === 0) {
      return reply("❌ Kategori *nothing* memerlukan minimal satu tag tambahan! Contoh: `.ns nothing maid` atau `.ns nothing cat-ears`")
    }

    // If no arguments were passed to general nekosia/ns command, show guide
    if ((command === 'nekosia' || command === 'ns') && args.length === 0) {
      const guideText = `✨ *NEKOSIA ANIME IMAGE ENGINE* ✨
━━━━━━━━━━━━━━━━━━━━
Cara penggunaan:
1. *Gambar Kategori*:
   └ \`.[neko|foxgirl|wolfgirl|maid|vtuber] [count] [rating] [tags...]\`
   Contoh: \`.neko 3 suggestive\`
   Contoh: \`.neko black-hair !short-hair\`

2. *Pencarian Kustom*:
   └ \`.ns <kategori> [count] [rating] [tags...]\`
   Contoh: \`.ns cute uniform count=2\`

3. *Tanpa Filter (Bypass)*:
   └ \`.ns nothing <tags...> [count] [rating]\`
   Contoh: \`.ns nothing headphones maid\`

4. *Detail Gambar*:
   └ \`.ns info <id_gambar>\`
   Contoh: \`.ns info 66bc6b7481a59a1cf2c79db5\`

5. *Cari Tag / Anime / Karakter*:
   └ \`.ns tags [keyword]\`
   Contoh: \`.ns tags hair\`

📊 *Daftar Kategori Utama*:
random, catgirl, foxgirl, wolfgirl, animal-ears, tail, cute, girl, young-girl, maid, vtuber, headphones, uniform, white-hair, blue-hair, long-hair, blonde, blue-eyes.
━━━━━━━━━━━━━━━━━━━━`
      return reply(guideText)
    }

    // 5. Check limit constraints
    const requiredLimit = sultan ? 0 : options.count
    if (!sultan && user.limit < requiredLimit) {
      return reply(`❌ Limit lu gak cukup! Butuh *${requiredLimit}* limit untuk mengambil *${options.count}* gambar, sedangkan sisa limit lu cuma *${user.limit}*.`)
    }

    // 6. Build request URL and parameters
    try {
      const params = new URLSearchParams()
      if (options.count > 1) {
        params.append('count', options.count)
      }
      if (options.tags.length > 0) {
        params.append('additionalTags', options.tags.join(','))
      }
      if (options.blacklist.length > 0) {
        params.append('blacklistedTags', options.blacklist.join(','))
      }
      if (options.rating) {
        params.append('rating', options.rating)
      }
      if (options.session && options.session !== 'none') {
        params.append('session', options.session)
        if (options.session === 'id') {
          const cleanId = sender.replace(/[^a-zA-Z0-9]/g, '')
          params.append('id', cleanId)
        }
      }

      const apiUrl = `https://api.nekosia.cat/api/v1/images/${options.category}?${params.toString()}`
      
      await reply(`⏳ Mengambil ${options.count} gambar anime...`)

      const res = await axios.get(apiUrl)
      
      if (res.data && res.data.success) {
        let imagesToSend = []
        if (options.count > 1 && Array.isArray(res.data.images)) {
          imagesToSend = res.data.images
        } else if (res.data.image) {
          imagesToSend = [res.data]
        }

        if (imagesToSend.length === 0) {
          return reply("❌ Tidak ada gambar yang cocok dengan kriteria pencarian.")
        }

        for (const img of imagesToSend) {
          const imageUrl = (img.metadata?.original?.size > 5000000 && img.image.compressed?.url)
            ? img.image.compressed.url
            : img.image.original.url

          await ryzu.sendMessage(from, {
            image: { url: imageUrl },
            caption: makeCaption(img)
          }, { quoted: msg })

          // Small delay between sending multiple images
          if (imagesToSend.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }

        // 7. Deduct limits
        if (!sultan) {
          // The main handler automatically deducts 1 limit. We deduct the rest.
          const extraDeduction = requiredLimit - 1
          if (extraDeduction > 0) {
            user.limit -= extraDeduction
          }
          await funcs.saveRPG(sender)
          await reply(`✅ Berhasil! Sisa limit: ${user.limit}`)
        } else {
          await reply("✅ Berhasil!")
        }

      } else {
        reply("❌ Gagal mendapatkan gambar dari server.")
      }

    } catch (err) {
      console.error(err)
      const errMsg = err.response?.data?.message || err.message || "Terjadi kesalahan pada server Nekosia."
      reply(`❌ *Gagal mengambil gambar!*\n\nDetail: ${errMsg}`)
    }
  }
}

// Helpers
const parseSmart = (args, defaultCategory) => {
  const options = {
    category: defaultCategory,
    count: 1,
    tags: [],
    blacklist: [],
    rating: 'safe',
    session: 'id',
  }
  
  const mainCategories = new Set([
    'random', 'catgirl', 'foxgirl', 'wolfgirl', 'animal-ears', 'tail', 'tail-with-ribbon', 'tail-from-under-skirt',
    'cute', 'cuteness-is-justice', 'blue-archive', 'girl', 'young-girl', 'maid', 'maid-uniform', 'vtuber',
    'w-sitting', 'lying-down', 'hands-forming-a-heart', 'wink', 'valentine', 'headphones',
    'thigh-high-socks', 'knee-high-socks', 'white-tights', 'black-tights', 'heterochromia', 'uniform',
    'sailor-uniform', 'hoodie', 'ribbon', 'white-hair', 'blue-hair', 'long-hair', 'blonde', 'blue-eyes',
    'purple-eyes', 'nothing'
  ])

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    // Key-value style: key=value or --key=value
    const kvMatch = arg.match(/^(?:--)?(category|count|tags|blacklist|rating|session|c|t|b|r|s)=(.*)$/i)
    if (kvMatch) {
      const key = kvMatch[1].toLowerCase()
      const val = kvMatch[2]
      setOption(key, val, options)
      continue
    }
    
    if (arg.startsWith('-')) {
      const key = arg.replace(/^-+/, '').toLowerCase()
      const val = args[i + 1]
      if (val && !val.startsWith('-')) {
        setOption(key, val, options)
        i++
        continue
      }
    }
    
    // Positional argument
    const argLow = arg.toLowerCase()
    
    // Check if it's rating
    if (argLow === 'safe' || argLow === 'suggestive') {
      options.rating = argLow
      continue
    }
    
    // Check if it's count
    const num = parseInt(arg)
    if (!isNaN(num) && num.toString() === arg) {
      options.count = Math.min(20, Math.max(1, num))
      continue
    }
    
    // Check if it's session setting
    if (argLow === 'nosession' || argLow === 'no-session') {
      options.session = 'none'
      continue
    }
    
    // Check if it's a main category
    if (mainCategories.has(argLow)) {
      options.category = argLow
      continue
    }
    
    // Otherwise, treat as additional tag. If it starts with '!', treat as blacklisted tag!
    if (arg.startsWith('!')) {
      options.blacklist.push(arg.slice(1))
    } else {
      options.tags.push(arg)
    }
  }
  
  return options
}

const setOption = (key, val, options) => {
  const valLow = val.toLowerCase()
  if (key === 'category') {
    options.category = valLow
  } else if (key === 'count' || key === 'c') {
    const num = parseInt(val)
    if (!isNaN(num)) {
      options.count = Math.min(20, Math.max(1, num))
    }
  } else if (key === 'tags' || key === 't') {
    options.tags.push(...val.split(',').map(t => t.trim()).filter(Boolean))
  } else if (key === 'blacklist' || key === 'b') {
    options.blacklist.push(...val.split(',').map(t => t.trim()).filter(Boolean))
  } else if (key === 'rating' || key === 'r') {
    if (valLow === 'safe' || valLow === 'suggestive') {
      options.rating = valLow
    }
  } else if (key === 'session' || key === 's') {
    if (valLow === 'ip' || valLow === 'id' || valLow === 'none' || valLow === 'false') {
      options.session = valLow === 'false' ? 'none' : valLow
    }
  }
}

const makeCaption = (img) => {
  const category = img.category || '-'
  const rating = img.rating || 'safe'
  const artist = img.attribution?.artist?.username || 'Unknown'
  const artistProfile = img.attribution?.artist?.profile ? `(${img.attribution.artist.profile})` : ''
  const anime = img.anime?.title || '-'
  const character = img.anime?.character ? `(Char: ${img.anime.character})` : ''
  const source = img.source?.url || img.source?.direct || '-'
  const tags = img.tags?.slice(0, 10).join(', ') || '-'
  const id = img.id || '-'

  return `✨ *NEKOSIA RANDOM IMAGE* ✨
━━━━━━━━━━━━━━━━━━━━
🏷️ *Category:* ${category}
🔞 *Rating:* ${rating}
🎨 *Artist:* ${artist} ${artistProfile}
📺 *Anime:* ${anime} ${character}
🔗 *Source:* ${source}
🏷️ *Tags:* ${tags}
🆔 *Image ID:* ${id}
━━━━━━━━━━━━━━━━━━━━`
}
