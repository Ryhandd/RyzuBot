const axios = require('axios')
const fs = require('fs')
const path = require('path')

const tmpDir = path.join(__dirname, "../tmp")
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

async function downloadAndSend(ryzu, from, msg, url, type, caption = "") {
    let ext = ".jpg"
    if (type === "video") ext = ".mp4"
    if (type === "audio") ext = ".mp3"

    const filePath = path.join(tmpDir, Date.now() + ext)

    const res = await axios({
        url,
        method: "GET",
        responseType: "stream"
    })

    const writer = fs.createWriteStream(filePath)

    await new Promise((resolve, reject) => {
        res.data.pipe(writer)
        writer.on("finish", resolve)
        writer.on("error", reject)
    })

    await ryzu.sendMessage(from, {
        [type]: { url: filePath },
        caption,
        mimetype: type === "audio" ? "audio/mpeg" : undefined 
    }, { quoted: msg })

    fs.unlinkSync(filePath)
}

module.exports = {
    name: "downloader",
    alias: ["tt", "tiktok", "ig", "igdl", "fb", "fbdl"],

    async execute(ctx) {
        const { ryzu, from, msg, command, q, reply, user, funcs, isCreator, isPremium, sender } = ctx

        if (!q) return reply(`Kirim linknya mana?\nContoh: *${ctx.prefix}${command} link*`)

        const sutan = isPremium || isCreator
        if (!sutan && user.limit <= 0) {
            return reply("❌ Limit lu abis! Beli di *.shop* atau upgrade ke *Premium* biar Unlimited.")
        }

        await reply(`⏳ Sedang memproses...`)

        let success = false
        const apikey = process.env.BETABOTZ_KEY

        try {
            if (command === "tt" || command === "tiktok") {
                let audioUrl = null

                try {
                    const [resSlide, resVid] = await Promise.all([
                        axios.get(`https://api.betabotz.eu.org/api/download/ttslide?url=${q}&apikey=${apikey}`).catch(() => ({ data: {} })),
                        axios.get(`https://api.betabotz.eu.org/api/download/tiktok?url=${q}&apikey=${apikey}`).catch(() => ({ data: {} }))
                    ])

                    const dataSlide = resSlide.data?.result
                    const dataVid = resVid.data?.result

                    if (dataSlide?.images?.length > 0) {
                        for (let i = 0; i < dataSlide.images.length; i++) {
                            await downloadAndSend(ryzu, from, msg, dataSlide.images[i], "image")
                        }
                        success = true
                    }

                    if (!success && dataVid?.video) {
                        await downloadAndSend(ryzu, from, msg, dataVid.video, "video", dataVid.title || "Done")
                        success = true
                    }

                    audioUrl = dataVid?.audio || dataSlide?.audio

                    if (audioUrl) {
                        await downloadAndSend(ryzu, from, msg, audioUrl, "audio")
                        success = true
                    }

                } catch (e) {
                    console.error("TikTok Error:", e)
                }
            }

            else if (command === "ig" || command === "igdl") {
                try {
                    const resIg = await axios.get(`https://api.betabotz.eu.org/api/download/igdownloader?url=${q}&apikey=${apikey}`)
                    const result = resIg.data.result

                    if (result?.length > 0) {
                        for (let i of result) {
                            let link = i.url || i
                            let isVideo = link.includes('.mp4')
                            await downloadAndSend(ryzu, from, msg, link, isVideo ? "video" : "image")
                        }
                        success = true
                    }
                } catch (e) {
                    console.error("IG Error:", e)
                }
            }

            else if (command === "fb" || command === "fbdl") {
                try {
                    const resFb = await axios.get(`https://api.betabotz.eu.org/api/download/fbdown?url=${q}&apikey=${apikey}`)
                    const d = resFb.data.result
                    let vid = d?.hd || d?.sd || (Array.isArray(d) ? d?.url : null)

                    if (vid) {
                        await downloadAndSend(ryzu, from, msg, vid, "video", "Facebook Done")
                        success = true
                    }
                } catch (e) {
                    console.error("FB Error:", e)
                }
            }

            if (success) {
                if (!sutan) {
                    user.limit -= 1
                    await funcs.saveRPG(sender)
                    await reply(`✅ Berhasil! Sisa limit: ${user.limit}`)
                } else {
                    await reply(`✅ Berhasil!`)
                }
            } else {
                reply("❌ Server gagal memproses atau link tidak valid.")
            }

        } catch (e) {
            console.error(e)
            reply("❌ Terjadi kesalahan internal.")
        }
    }
}