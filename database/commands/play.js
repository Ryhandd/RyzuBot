const yts = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "play",
    alias: ["play", "ytmp3", "ytmp4"],
    execute: async ({ ryzu, from, msg, command, q, reply }) => {
        if (!q) return reply("Judul/Link YouTube-nya mana?");
        
        try {
            // 1. Search YouTube
            let search = await yts(q);
            let vid = search.videos[0];
            if (!vid) return reply("Gak nemu videonya, coba judul lain.");

            // 2. Tampilan SendCard (External Ad Reply)
            let caption = `🎵 *YOUTUBE PLAY*\n\n`;
            caption += `📝 *Judul:* ${vid.title}\n`;
            caption += `⏱️ *Durasi:* ${vid.timestamp}\n`;
            caption += `👀 *Views:* ${vid.views}\n`;
            caption += `🔗 *Link:* ${vid.url}\n\n`;
            caption += `⌛ Sedang mendownload ${command.includes('mp4') ? 'Video' : 'Audio'}...`;

            await ryzu.sendMessage(from, {
                text: caption,
                contextInfo: {
                    externalAdReply: {
                        title: vid.title,
                        body: `Duration: ${vid.timestamp} | Channel: ${vid.author.name}`,
                        thumbnailUrl: vid.thumbnail,
                        sourceUrl: vid.url,
                        mediaType: 1,
                        renderLargerThumbnail: true // Thumbnail jadi besar
                    }
                }
            }, { quoted: msg });

            // 3. Download (Multi API)
            const isVideo = command.includes('mp4');
            const apis = [
                {
                    url: `https://api.widipe.com.my.id/download/ytdl?url=${vid.url}`,
                    key: isVideo ? 'mp4' : 'mp3'
                },
                {
                    url: `https://api.nekolabs.web.id/downloader/youtube/v1?url=${vid.url}&format=${isVideo ? '720' : 'mp3'}`,
                    key: 'downloadUrl'
                },
                {
                    url: `https://api.betabotz.eu.org/api/download/ytmp3?url=${vid.url}&apikey=Btz-pUjTd`,
                    key: 'mp3'
                }
            ];

            let dlUrl = null;
            for (let api of apis) {
                try {
                    let res = await axios.get(api.url);
                    let data = res.data.result || res.data;
                    if (data && data[api.key]) { dlUrl = data[api.key]; break; }
                } catch (e) {}
            }

            if (!dlUrl) return reply("❌ Server download sedang sibuk, coba lagi nanti.");

            // 4. Proses Simpan & Kirim
            const ext = isVideo ? 'mp4' : 'mp3';
            const fileName = `./database/music/${vid.videoId}.${ext}`;
            
            // Pastikan folder ada
            if (!fs.existsSync('./database/music')) fs.mkdirSync('./database/music', { recursive: true });

            const writer = fs.createWriteStream(fileName)
            const response = await axios({
                url: dlUrl,
                method: 'GET',
                responseType: 'stream'
            })

            await new Promise((resolve, reject) => {
                response.data.pipe(writer)
                writer.on('finish', resolve)
                writer.on('error', reject)
            })

            if (isVideo) {
                await ryzu.sendMessage(from, { video: { url: fileName }, caption: `✅ Sukses: ${vid.title}` }, { quoted: msg });
            } else {
                await ryzu.sendMessage(from, { 
                    audio: { url: fileName }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${vid.title}.mp3`
                }, { quoted: msg });
            }
            
            // Hapus file setelah terkirim agar storage tidak penuh
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);

        } catch (e) { 
            console.log(e); 
            reply("❌ Terjadi kesalahan saat memproses data."); 
        }
    }
};