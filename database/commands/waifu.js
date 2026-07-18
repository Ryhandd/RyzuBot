const axios = require('axios')

module.exports = {
  name: "waifu",
  alias: ["wf"],
  execute: async (ctx) => {
    const { ryzu, from, msg, reply, user, isCreator, isPremium, sender, funcs, command, args } = ctx

    const sultan = isPremium || isCreator

    // 1. Handle subcommands (info, get, tags)
    const firstArg = args[0]?.toLowerCase()
    
    if (firstArg === 'get' || firstArg === 'info') {
      const imageId = parseInt(args[1])
      if (isNaN(imageId)) {
        return reply("❌ Masukkan ID gambar berupa angka! Contoh: `.waifu info 6175`")
      }
      
      if (!sultan && user.limit <= 0) {
        return reply("❌ Limit lu abis! Beli di *.shop* atau upgrade ke *Premium*.")
      }

      try {
        const res = await axios.get(`https://api.waifu.im/images?IncludedIds=${imageId}`)
        if (res.data && res.data.items && res.data.items.length > 0) {
          const img = res.data.items[0]
          
          await ryzu.sendMessage(from, {
            image: { url: img.url },
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
        reply(`❌ Gagal mengambil detail gambar.`)
      }
      return
    }

    if (firstArg === 'tags' || firstArg === 'search') {
      try {
        const res = await axios.get('https://api.waifu.im/tags')
        if (res.data && res.data.items) {
          const data = res.data.items
          const query = args.slice(1).join(' ').toLowerCase().trim()
          
          if (!query) {
            const sfwTags = data.filter(t => ![3, 2, 4, 6, 1, 9, 8].includes(t.id)).map(t => t.slug)
            const nsfwTags = data.filter(t => [3, 2, 4, 6, 1, 9, 8].includes(t.id)).map(t => t.slug)
            
            const helpTags = `🏷️ *DAFTAR TAG WAIFU.IM* 🏷️
━━━━━━━━━━━━━━━━━━━━
Untuk mencari tag, gunakan:
*.waifu tags <keyword>*
Contoh: *.waifu tags genshin*

❇️ *SFW Tags:*
${sfwTags.join(', ')}

🔞 *NSFW Tags:*
${nsfwTags.join(', ')}
━━━━━━━━━━━━━━━━━━━━`
            return reply(helpTags)
          }

          const matched = data.filter(t => t.slug.includes(query) || t.name.toLowerCase().includes(query))
          
          const searchResult = `🔍 *Hasil Pencarian Tag Waifu.im* 🔍
Keyword: *${query}*
━━━━━━━━━━━━━━━━━━━━
🏷️ *Tags Ditemukan (${matched.length}):*
${matched.map(t => `${t.name} (${t.slug})`).join('\n') || '-'}
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

    // 2. Parse arguments using smart parser
    const options = parseSmart(args)

    // Check limit constraints
    const requiredLimit = sultan ? 0 : options.count
    if (!sultan && user.limit < requiredLimit) {
      return reply(`❌ Limit lu gak cukup! Butuh *${requiredLimit}* limit untuk mengambil *${options.count}* waifu, sedangkan sisa limit lu cuma *${user.limit}*.`)
    }

    // 3. Build request URL
    try {
      const params = new URLSearchParams()
      params.append('PageSize', options.count)
      params.append('IsNsfw', options.isNsfw)
      
      if (options.orientation !== 'All') {
        params.append('Orientation', options.orientation)
      }
      
      options.tags.forEach(t => params.append('IncludedTags', t))
      options.blacklist.forEach(b => params.append('ExcludedTags', b))

      const apiUrl = `https://api.waifu.im/images?${params.toString()}`

      await reply(`⏳ Mengambil ${options.count} waifu...`)

      const res = await axios.get(apiUrl)
      
      if (res.data && res.data.items && res.data.items.length > 0) {
        const imagesToSend = res.data.items

        for (const img of imagesToSend) {
          await ryzu.sendMessage(from, {
            image: { url: img.url },
            caption: makeCaption(img)
          }, { quoted: msg })

          if (imagesToSend.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }

        // Deduct limits
        if (!sultan) {
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
        reply("❌ Tidak ada gambar waifu yang cocok dengan kriteria pencarian.")
      }

    } catch (err) {
      console.error(err)
      reply("❌ Gagal mengambil gambar waifu dari server.")
    }
  }
}

// Helpers
const parseSmart = (args) => {
  const options = {
    count: 1,
    tags: [],
    blacklist: [],
    isNsfw: 'False',
    orientation: 'All',
  }

  const validTags = new Set([
    'waifu', 'maid', 'uniform', 'selfies', 'genshin-impact', 'raiden-shogun', 'marin-kitagawa', 'mori-calliope', 'kamisato-ayaka', 'rem', 'nami', 'one-piece',
    'ero', 'ecchi', 'oppai', 'hentai', 'milf', 'ass', 'paizuri', 'oral'
  ])

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const argLow = arg.toLowerCase()

    // Count (PageSize)
    const num = parseInt(arg)
    if (!isNaN(num) && num.toString() === arg) {
      options.count = Math.min(30, Math.max(1, num))
      continue
    }

    // NSFW flags
    if (argLow === 'nsfw' || argLow === 'hentai' || argLow === 'adult') {
      options.isNsfw = 'True'
      if (argLow === 'hentai' && !options.tags.includes('hentai')) {
        options.tags.push('hentai')
      }
      continue
    }
    if (argLow === 'sfw' || argLow === 'safe') {
      options.isNsfw = 'False'
      continue
    }
    if (argLow === 'all') {
      options.isNsfw = 'All'
      continue
    }

    // Orientation
    if (argLow === 'portrait' || argLow === 'vertical') {
      options.orientation = 'Portrait'
      continue
    }
    if (argLow === 'landscape' || argLow === 'horizontal') {
      options.orientation = 'Landscape'
      continue
    }
    if (argLow === 'square') {
      options.orientation = 'Square'
      continue
    }

    // Tags
    if (arg.startsWith('!')) {
      const cleanTag = arg.slice(1).toLowerCase()
      if (validTags.has(cleanTag)) {
        options.blacklist.push(cleanTag)
      }
    } else {
      if (validTags.has(argLow)) {
        options.tags.push(argLow)
      }
    }
  }

  // Default to waifu tag if no tags are provided
  if (options.tags.length === 0) {
    options.tags.push('waifu')
  }

  return options
}

const makeCaption = (img) => {
  const tagsList = img.tags?.map(t => t.name).join(', ') || '-'
  return `✨ *WAIFU.IM RANDOM IMAGE* ✨
━━━━━━━━━━━━━━━━━━━━
🆔 *ID:* ${img.id}
🎨 *Color:* ${img.dominantColor || '-'}
📐 *Resolution:* ${img.width}x${img.height}
🔞 *NSFW:* ${img.isNsfw ? 'Yes 🔞' : 'No ❇️'}
🔗 *Source:* ${img.source || '-'}
🏷️ *Tags:* ${tagsList}
━━━━━━━━━━━━━━━━━━━━`
}
