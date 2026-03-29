const axios = require("axios");

module.exports = {
    name: "cuaca",
    alias: ["weather"],

    execute: async ({ q, reply }) => {
        if (!q) return reply("Contoh: .cuaca Jakarta");

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
};