<<<<<<< HEAD
const axios = require('axios');

module.exports = {
    name: "downloader",
    alias: ["tt", "tiktok", "ig", "igdl", "fb", "fbdl"],
    async execute(ctx) {
        const { ryzu, from, msg, command, q, reply, user, funcs, isCreator, isPremium } = ctx;
        
        if (!q) return reply(`Kirim linknya mana?\nContoh: *${ctx.prefix}${command} link*`);

        const sutan = isPremium || isCreator;
        if (!sutan && user.limit <= 0) {
            return reply("❌ Limit lu abis! Beli di *.shop* atau upgrade ke *Premium* biar Unlimited.");
        }

        await reply(`⏳ Sedang memproses...`);

        try {
            let success = false;
            const apikey = "Btz-pUjTd";

            // ================= [ TIKTOK HYBRID HANDLER ] =================
            if (command === "tt" || command === "tiktok") {
                let success = false;
                let audioUrl = null;
                const apikey = "Btz-pUjTd";

                try {
                    const [resSlide, resVid] = await Promise.all([
                        axios.get(`https://api.betabotz.eu.org/api/download/ttslide?url=${q}&apikey=Btz-pUjTd`).catch(() => ({ data: {} })),
                        axios.get(`https://api.betabotz.eu.org/api/download/tiktok?url=${q}&apikey=Btz-pUjTd`).catch(() => ({ data: {} }))
                    ]);

                    const dataSlide = resSlide.data?.result;
                    const dataVid = resVid.data?.result;

                    if (dataSlide && dataSlide.images && dataSlide.images.length > 0) {
                        try {
                            await ryzu.sendMessage(from, { image: { url: dataSlide.images[0] } }, { quoted: msg });
                            for (let i = 1; i < dataSlide.images.length; i++) {
                                await ryzu.sendMessage(from, { image: { url: dataSlide.images[i] } });
                            }
                            success = true;
                        } catch (err) {
                            console.log("CDN Slide Error, fallback ke Video...");
                        }
                    }

                    if (!success && dataVid && dataVid.video) {
                        await ryzu.sendMessage(from, { 
                            video: { url: dataVid.video }, 
                            caption: dataVid.title || "Done" 
                        }, { quoted: msg });
                        success = true;
                    }

                    audioUrl = dataVid?.audio || dataSlide?.audio;
                    if (success && audioUrl) {
                        await ryzu.sendMessage(from, { 
                            audio: { url: audioUrl }, 
                            mimetype: 'audio/mpeg' 
                        }, { quoted: msg });
                    }

                } catch (e) {
                    console.error("TikTok Error:", e);
                }

                // Proteksi Akhir
                if (success) {
                    if (!sutan) {
                        user.limit -= 1;
                        funcs.saveRPG();
                        await reply(`✅ Berhasil! Sisa limit: ${user.limit}`);
                    }
                } else {
                    return reply("❌ Semua server (Slide & Video) gagal memproses link ini. Coba pastikan link valid atau whitelist IP lu di Betabotz!");
                }
                return;
            }

            // ================= [ INSTAGRAM HANDLER ] =================
            else if (command === "ig" || command === "igdl") {
                try {
                    const resIg = await axios.get(`https://api.betabotz.eu.org/api/download/igdownloader?url=${q}&apikey=Btz-pUjTd`);
                    const result = resIg.data.result;
                    if (result && result.length > 0) {
                        for (let i of result) {
                            let link = i.url || i;
                            let isVideo = link.includes('.mp4');
                            await ryzu.sendMessage(from, { [isVideo ? 'video' : 'image']: { url: link } }, { quoted: msg });
                        }
                        success = true;
                    }
                } catch (e) {}
            }

            // ================= [ FACEBOOK HANDLER ] =================
            else if (command === "fb" || command === "fbdl") {
                try {
                    const resFb = await axios.get(`https://api.betabotz.eu.org/api/download/fbdown?url=${q}&apikey=Btz-pUjTd`);
                    const d = resFb.data.result;
                    let vid = d.hd || d.sd || (Array.isArray(d) ? d[0].url : null);
                    if (vid) {
                        await ryzu.sendMessage(from, { video: { url: vid }, caption: "Facebook Done" }, { quoted: msg });
                        success = true;
                    }
                } catch (e) {}
            }

            // ================= [ PENYELESAIAN ] =================
            if (success) {
                if (!sutan) {
                    user.limit -= 1;
                    funcs.saveRPG();
                    await reply(`✅ Berhasil! Sisa limit: ${user.limit}`);
                } else {
                    await reply(`✅ Berhasil!`);
                }
            } else {
                reply("❌ Maaf, server Betabotz sedang bermasalah atau link tidak didukung. Pastikan IP lu udah di-whitelist di web Betabotz!");
            }

        } catch (e) {
            console.error(e);
            reply("❌ Terjadi kesalahan internal.");
        }
    }
=======
const axios = require('axios');

module.exports = {
    name: "downloader",
    alias: ["tt", "tiktok", "ig", "igdl", "fb", "fbdl"],
    async execute(ctx) {
        const { ryzu, from, msg, command, q, reply, user, funcs, isCreator, isPremium } = ctx;
        
        if (!q) return reply(`Kirim linknya mana?\nContoh: *${ctx.prefix}${command} link*`);

        const sutan = isPremium || isCreator;
        if (!sutan && user.limit <= 0) {
            return reply("❌ Limit lu abis! Beli di *.shop* atau upgrade ke *Premium* biar Unlimited.");
        }

        await reply(`⏳ Sedang memproses...`);

        try {
            let success = false;
            const apikey = "Btz-pUjTd";

            // ================= [ TIKTOK HYBRID HANDLER ] =================
            if (command === "tt" || command === "tiktok") {
                let success = false;
                let audioUrl = null;
                const apikey = "Btz-pUjTd";

                try {
                    const [resSlide, resVid] = await Promise.all([
                        axios.get(`https://api.betabotz.eu.org/api/download/ttslide?url=${q}&apikey=Btz-pUjTd`).catch(() => ({ data: {} })),
                        axios.get(`https://api.betabotz.eu.org/api/download/tiktok?url=${q}&apikey=Btz-pUjTd`).catch(() => ({ data: {} }))
                    ]);

                    const dataSlide = resSlide.data?.result;
                    const dataVid = resVid.data?.result;

                    if (dataSlide && dataSlide.images && dataSlide.images.length > 0) {
                        try {
                            await ryzu.sendMessage(from, { image: { url: dataSlide.images[0] } }, { quoted: msg });
                            for (let i = 1; i < dataSlide.images.length; i++) {
                                await ryzu.sendMessage(from, { image: { url: dataSlide.images[i] } });
                            }
                            success = true;
                        } catch (err) {
                            console.log("CDN Slide Error, fallback ke Video...");
                        }
                    }

                    if (!success && dataVid && dataVid.video) {
                        await ryzu.sendMessage(from, { 
                            video: { url: dataVid.video }, 
                            caption: dataVid.title || "Done" 
                        }, { quoted: msg });
                        success = true;
                    }

                    audioUrl = dataVid?.audio || dataSlide?.audio;
                    if (success && audioUrl) {
                        await ryzu.sendMessage(from, { 
                            audio: { url: audioUrl }, 
                            mimetype: 'audio/mpeg' 
                        }, { quoted: msg });
                    }

                } catch (e) {
                    console.error("TikTok Error:", e);
                }

                // Proteksi Akhir
                if (success) {
                    if (!sutan) {
                        user.limit -= 1;
                        funcs.saveRPG();
                        await reply(`✅ Berhasil! Sisa limit: ${user.limit}`);
                    }
                } else {
                    return reply("❌ Semua server (Slide & Video) gagal memproses link ini. Coba pastikan link valid atau whitelist IP lu di Betabotz!");
                }
                return;
            }

            // ================= [ INSTAGRAM HANDLER ] =================
            else if (command === "ig" || command === "igdl") {
                try {
                    const resIg = await axios.get(`https://api.betabotz.eu.org/api/download/igdownloader?url=${q}&apikey=Btz-pUjTd`);
                    const result = resIg.data.result;
                    if (result && result.length > 0) {
                        for (let i of result) {
                            let link = i.url || i;
                            let isVideo = link.includes('.mp4');
                            await ryzu.sendMessage(from, { [isVideo ? 'video' : 'image']: { url: link } }, { quoted: msg });
                        }
                        success = true;
                    }
                } catch (e) {}
            }

            // ================= [ FACEBOOK HANDLER ] =================
            else if (command === "fb" || command === "fbdl") {
                try {
                    const resFb = await axios.get(`https://api.betabotz.eu.org/api/download/fbdown?url=${q}&apikey=Btz-pUjTd`);
                    const d = resFb.data.result;
                    let vid = d.hd || d.sd || (Array.isArray(d) ? d[0].url : null);
                    if (vid) {
                        await ryzu.sendMessage(from, { video: { url: vid }, caption: "Facebook Done" }, { quoted: msg });
                        success = true;
                    }
                } catch (e) {}
            }

            // ================= [ PENYELESAIAN ] =================
            if (success) {
                if (!sutan) {
                    user.limit -= 1;
                    funcs.saveRPG();
                    await reply(`✅ Berhasil! Sisa limit: ${user.limit}`);
                } else {
                    await reply(`✅ Berhasil!`);
                }
            } else {
                reply("❌ Maaf, server Betabotz sedang bermasalah atau link tidak didukung. Pastikan IP lu udah di-whitelist di web Betabotz!");
            }

        } catch (e) {
            console.error(e);
            reply("❌ Terjadi kesalahan internal.");
        }
    }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
};