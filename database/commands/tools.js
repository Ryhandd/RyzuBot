// ====================================================
// database/commands/tools.js (NEW - COMBINED TOOLS)
// Free APIs: wttr.in (cuaca), exchangerate-api (kurs),
//            nominatim (maps), api.quotable.io (quotes),
//            api.dictionaryapi.dev (kamus), catfact.ninja,
//            dog.ceo, agify.io, api.genderize.io
// ====================================================

const axios = require("axios")

module.exports = {
  name: "tools",
  alias: [
    "cuaca", "weather",
    "kurs", "rate",
    "quote", "motivasi",
    "kamus", "define",
    "catfact", "dogfact",
    "tebakumur", "tebakgender",
    "qr", "translate",
    "ip", "shorturl",
    "color", "base64",
    "calc", "encode", "decode",
    "covid", "timezone"
  ],
  execute: async ({ ryzu, from, msg, command, q, args, reply }) => {

    // ===================== CUACA =====================
    if (command === "cuaca" || command === "weather") {
      if (!q) return reply("Contoh: .cuaca Jakarta")
      try {
        const res = await axios.get(`https://wttr.in/${encodeURIComponent(q)}?format=j1`, { timeout: 10000 })
        const d = res.data
        const current = d.current_condition[0]
        const area = d.nearest_area[0]

        const lokasi = area.areaName[0].value + ", " + area.country[0].value
        const suhu = current.temp_C + "°C"
        const feels = current.FeelsLikeC + "°C"
        const humid = current.humidity + "%"
        const wind = current.windspeedKmph + " km/h"
        const desc = current.weatherDesc[0].value
        const uv = current.uvIndex

        const icon = {
          "Sunny": "☀️", "Clear": "🌙", "Partly cloudy": "⛅",
          "Cloudy": "☁️", "Overcast": "☁️", "Mist": "🌫️",
          "Rain": "🌧️", "Drizzle": "🌦️", "Thunder": "⛈️",
          "Snow": "🌨️", "Fog": "🌫️"
        }
        const cuacaIcon = Object.entries(icon).find(([k]) => desc.includes(k))?.[1] || "🌡️"

        return reply(
          `${cuacaIcon} *CUACA - ${lokasi.toUpperCase()}*\n\n` +
          `🌡️ Suhu: ${suhu} (Terasa ${feels})\n` +
          `💧 Kelembaban: ${humid}\n` +
          `💨 Angin: ${wind}\n` +
          `☁️ Kondisi: ${desc}\n` +
          `☀️ UV Index: ${uv}`
        )
      } catch (e) {
        return reply("❌ Gagal ambil data cuaca. Cek nama kotanya.")
      }
    }

    // ===================== KURS MATA UANG =====================
    if (command === "kurs" || command === "rate") {
      if (!q) return reply("Contoh: .kurs 100 USD ke IDR\natau .kurs IDR (lihat rate hari ini)")
      try {
        // Format: .kurs 100 USD ke IDR
        const match = q.match(/^(\d+(?:\.\d+)?)\s+([A-Z]{3})\s+(?:ke|to)\s+([A-Z]{3})$/i)
        if (match) {
          const [, amount, from_curr, to_curr] = match
          const res = await axios.get(`https://open.er-api.com/v6/latest/${from_curr.toUpperCase()}`)
          const rate = res.data.rates[to_curr.toUpperCase()]
          if (!rate) return reply("❌ Kode mata uang tidak ditemukan.")
          const result = (parseFloat(amount) * rate).toLocaleString("id-ID", { maximumFractionDigits: 4 })
          return reply(`💱 *KONVERSI KURS*\n\n${amount} ${from_curr.toUpperCase()} = *${result} ${to_curr.toUpperCase()}*\n\nRate: 1 ${from_curr.toUpperCase()} = ${rate.toLocaleString("id-ID", { maximumFractionDigits: 4 })} ${to_curr.toUpperCase()}`)
        }
        // Format: .kurs IDR (list rates)
        const curr = q.trim().toUpperCase()
        const res = await axios.get(`https://open.er-api.com/v6/latest/USD`)
        const popular = ["IDR", "MYR", "SGD", "EUR", "GBP", "JPY", "KRW", "AUD", "CNY"]
        let text = `💱 *KURS USD HARI INI*\n\n`
        for (const c of popular) {
          text += `${c}: ${res.data.rates[c]?.toLocaleString("id-ID") || "-"}\n`
        }
        return reply(text)
      } catch (e) {
        return reply("❌ Gagal ambil data kurs.")
      }
    }

    // ===================== QUOTE MOTIVASI =====================
    if (command === "quote" || command === "motivasi") {
      try {
        const res = await axios.get("https://api.quotable.io/random?tags=inspirational,motivational", { timeout: 8000 })
        const { content, author } = res.data
        return reply(`💬 *QUOTE OF THE DAY*\n\n_"${content}"_\n\n— *${author}*`)
      } catch (e) {
        // Fallback quotes Indonesia
        const quotes = [
          "Jangan pernah menyerah, karena setiap hari adalah kesempatan baru. 💪",
          "Sukses bukan milik orang yang tidak pernah gagal, tapi milik orang yang tidak pernah berhenti. 🔥",
          "Mulailah dari mana kamu berada, gunakan apa yang kamu punya, lakukan apa yang kamu bisa. ✨",
          "Setiap perjalanan panjang dimulai dari langkah pertama. 🚶",
          "Kamu lebih kuat dari yang kamu kira, lebih berani dari yang kamu percaya. 💫"
        ]
        return reply(`💬 *MOTIVASI*\n\n_${quotes[Math.floor(Math.random() * quotes.length)]}_`)
      }
    }

    // ===================== KAMUS INGGRIS =====================
    if (command === "kamus" || command === "define") {
      if (!q) return reply("Contoh: .kamus serendipity")
      try {
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`)
        const data = res.data[0]
        let text = `📖 *KAMUS - ${data.word.toUpperCase()}*\n\n`
        if (data.phonetics?.[0]?.text) text += `🔊 Fonetik: ${data.phonetics[0].text}\n\n`
        data.meanings.slice(0, 2).forEach((m) => {
          text += `📝 *${m.partOfSpeech.toUpperCase()}*\n`
          m.definitions.slice(0, 2).forEach((d, i) => {
            text += `${i + 1}. ${d.definition}\n`
            if (d.example) text += `   _"${d.example}"_\n`
          })
          text += "\n"
        })
        return reply(text)
      } catch (e) {
        return reply(`❌ Kata "${q}" tidak ditemukan di kamus.`)
      }
    }

    // ===================== CAT FACT =====================
    if (command === "catfact") {
      try {
        const res = await axios.get("https://catfact.ninja/fact")
        return reply(`🐱 *CAT FACT*\n\n${res.data.fact}`)
      } catch (e) {
        return reply("❌ Gagal ambil cat fact.")
      }
    }

    // ===================== DOG IMAGE =====================
    if (command === "dogfact") {
      try {
        const res = await axios.get("https://dog.ceo/api/breeds/image/random")
        await ryzu.sendMessage(from, { image: { url: res.data.message }, caption: "🐶 *RANDOM DOG!*" }, { quoted: msg })
      } catch (e) {
        return reply("❌ Gagal ambil gambar anjing.")
      }
    }

    // ===================== TEBAK UMUR DARI NAMA =====================
    if (command === "tebakumur") {
      if (!q) return reply("Contoh: .tebakumur Budi")
      try {
        const res = await axios.get(`https://agify.io/?name=${encodeURIComponent(q)}`)
        return reply(`🎂 *TEBAK UMUR*\n\nNama: *${q}*\nPerkiraan Umur: *${res.data.age} tahun*\nData dari: ${res.data.count.toLocaleString()} orang`)
      } catch (e) {
        return reply("❌ Gagal.")
      }
    }

    // ===================== TEBAK GENDER DARI NAMA =====================
    if (command === "tebakgender") {
      if (!q) return reply("Contoh: .tebakgender Siti")
      try {
        const res = await axios.get(`https://api.genderize.io/?name=${encodeURIComponent(q)}`)
        const icon = res.data.gender === "male" ? "♂️" : "♀️"
        const gender = res.data.gender === "male" ? "Laki-laki" : "Perempuan"
        const prob = (res.data.probability * 100).toFixed(1)
        return reply(`${icon} *TEBAK GENDER*\n\nNama: *${q}*\nGender: *${gender}*\nProbabilitas: *${prob}%*`)
      } catch (e) {
        return reply("❌ Gagal.")
      }
    }

    // ===================== QR CODE GENERATOR =====================
    if (command === "qr") {
      if (!q) return reply("Contoh: .qr https://google.com")
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(q)}&color=000000&bgcolor=FFFFFF&format=png`
        await ryzu.sendMessage(from, { image: { url: qrUrl }, caption: `📱 *QR CODE*\n\nData: ${q}` }, { quoted: msg })
      } catch (e) {
        return reply("❌ Gagal generate QR.")
      }
    }

    // ===================== TRANSLATE (LibreTranslate) =====================
    if (command === "translate") {
      if (!q) return reply("Contoh: .translate en:id Hello World\n(en=dari bahasa apa, id=ke bahasa apa)")
      try {
        const match = q.match(/^([a-z]{2}):([a-z]{2})\s+(.+)$/i)
        if (!match) return reply("Format: .translate en:id teks yang mau ditranslate")
        const [, source, target, text] = match
        const res = await axios.post("https://translate.terraprint.co/translate", {
          q: text, source: source.toLowerCase(), target: target.toLowerCase(), format: "text"
        }, { timeout: 15000 })
        return reply(`🌐 *TRANSLATE*\n\n📤 ${source.toUpperCase()}: ${text}\n📥 ${target.toUpperCase()}: ${res.data.translatedText}`)
      } catch (e) {
        return reply("❌ Gagal translate. Coba lagi.")
      }
    }

    // ===================== BASE64 ENCODE/DECODE =====================
    if (command === "base64" || command === "encode" || command === "decode") {
      if (!q) return reply("Contoh:\n.encode teks apa aja\n.decode dGVrcyBhcGEgYWph")
      try {
        if (command === "encode" || (command === "base64" && args[0] !== "decode")) {
          const encoded = Buffer.from(q).toString("base64")
          return reply(`🔒 *BASE64 ENCODE*\n\nInput: ${q}\nOutput:\n\`\`\`${encoded}\`\`\``)
        } else {
          const decoded = Buffer.from(q, "base64").toString("utf-8")
          return reply(`🔓 *BASE64 DECODE*\n\nInput: ${q}\nOutput: ${decoded}`)
        }
      } catch (e) {
        return reply("❌ Gagal proses base64.")
      }
    }

    // ===================== CALCULATOR SAFE =====================
    if (command === "calc") {
      if (!q) return reply("Contoh: .calc 2+2*3")
      try {
        // Safe eval - hanya izinkan karakter matematika
        const safe = q.replace(/[^0-9+\-*/%.() ]/g, "")
        if (!safe) return reply("❌ Ekspresi tidak valid.")
        // eslint-disable-next-line no-new-func
        const result = new Function(`"use strict"; return (${safe})`)()
        return reply(`🧮 *KALKULATOR*\n\n${safe} = *${result}*`)
      } catch (e) {
        return reply("❌ Ekspresi matematika tidak valid.")
      }
    }

    // ===================== TIMEZONE =====================
    if (command === "timezone") {
      if (!q) return reply("Contoh: .timezone Asia/Jakarta")
      try {
        const now = new Date()
        const options = { timeZone: q, dateStyle: "full", timeStyle: "long" }
        const formatted = new Intl.DateTimeFormat("id-ID", options).format(now)
        return reply(`🕐 *WAKTU DI ${q.toUpperCase()}*\n\n${formatted}`)
      } catch (e) {
        return reply(`❌ Timezone tidak valid.\nContoh: Asia/Jakarta, America/New_York, Europe/London`)
      }
    }

    // ===================== SHORTEN URL =====================
    if (command === "shorturl") {
      if (!q) return reply("Contoh: .shorturl https://google.com")
      try {
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`)
        return reply(`🔗 *SHORTEN URL*\n\nOriginal: ${q}\nShortened: ${res.data}`)
      } catch (e) {
        return reply("❌ Gagal shorten URL.")
      }
    }
  }
}