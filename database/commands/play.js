const yts = require("yt-search")
const axios = require("axios")
const fs = require("fs")
const path = require("path")
const urlModule = require("url")
const ffmpeg = require("fluent-ffmpeg")
const ffmpegStatic = require("ffmpeg-static")
ffmpeg.setFfmpegPath(ffmpegStatic)

async function getDirectYtUrl(videoUrl) {
  let title = 'Video';
  let urls = [];
  let success = false;
  
  // 1️⃣ Coba Ummy API (lebih stabil daripada SaveFrom)
  try {
    const siputRes = await axios.get(`https://api.siputzx.my.id/api/d/ummy?url=${encodeURIComponent(videoUrl)}`);
    if (siputRes.data && siputRes.data.status && siputRes.data.data) {
      const item = siputRes.data.data;
      title = item.meta?.title || title;
      urls = item.url || [];
      success = true;
    }
  } catch (e) {
    console.error('[PLAY] Ummy API failed:', e.message);
  }
  
  // 2️⃣ Fallback ke SaveFrom API
  if (!success || urls.length === 0) {
    const siputRes = await axios.get(`https://api.siputzx.my.id/api/d/savefrom?url=${encodeURIComponent(videoUrl)}`);
    if (!siputRes.data || !siputRes.data.status || !siputRes.data.data?.[0]) {
      throw new Error('Gagal mendapatkan data dari SaveFrom.');
    }
    const firstItem = siputRes.data.data[0];
    if (firstItem.type === "error" || !firstItem.data?.[0]) {
      throw new Error('SaveFrom API error: ' + (firstItem.message || 'Unknown error'));
    }
    const item = firstItem.data[0];
    title = item.meta?.title || title;
    urls = item.url || [];
  }
  
  const mp4Urls = urls.filter(u => 
    (u.ext === 'mp4' || u.name === 'MP4') && 
    u.url && 
    u.no_audio !== true && 
    u.no_audio !== 'true'
  );
  
  if (mp4Urls.length === 0) {
    throw new Error('Format MP4 dengan audio tidak ditemukan.');
  }

  // Prioritaskan link direct googlevideo.com terlebih dahulu agar tidak memicu task konversi
  const directObj = mp4Urls.find(u => u.url.includes('googlevideo.com'));
  
  const videoObj = directObj 
                || mp4Urls.find(u => u.isConverterUI || u.downloadable)
                || mp4Urls[0];
  
  const targetUrl = videoObj.url;
  
  if (targetUrl.includes('googlevideo.com')) {
    return { url: targetUrl, title, isDirect: true };
  }
  
  const redirectRes = await axios.get(targetUrl, {
    maxRedirects: 0,
    validateStatus: (status) => status >= 200 && status < 400,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': 'https://en.savefrom.net/'
    }
  });
  
  const location = redirectRes.headers.location;
  if (!location) {
    throw new Error('No redirect location header found');
  }
  
  if (location.includes('/prod-new/download/') || location.includes('/download/')) {
    const finalUrl = location.startsWith('http') ? location : new urlModule.URL(location, targetUrl).toString();
    return { url: finalUrl, title, isDirect: true };
  }
  
  const parsedUrl = urlModule.parse(location, true);
  const t = parsedUrl.query.t;
  if (!t) {
    throw new Error('Task ID (t) not found in redirect location: ' + location);
  }
  
  const parsedTarget = urlModule.parse(targetUrl);
  const sseHost = `${parsedTarget.protocol}//${parsedTarget.host}`;
  const sseUrl = `${sseHost}/tasks/${t}`;
  
  return new Promise((resolve, reject) => {
    axios.get(sseUrl, {
      responseType: 'stream',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }).then(response => {
      let resolved = false;
      response.data.on('data', (chunk) => {
        const text = chunk.toString();
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.substring(5).trim());
              if (data.status === 'finished' || data.status === 'converted' || data.downloadUrl) {
                resolved = true;
                response.data.destroy();
                resolve({ url: data.downloadUrl, title, isDirect: true });
                break;
              }
              if (data.status === 'failed') {
                resolved = true;
                response.data.destroy();
                reject(new Error('Conversion task failed on server.'));
                break;
              }
            } catch (e) {}
          }
        }
      });
      
      response.data.on('end', () => {
        if (!resolved) reject(new Error('SSE connection ended without result.'));
      });
    }).catch(reject);
  });
}

function downloadFile(url, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', (err) => reject(err));
    } catch (e) {
      reject(e);
    }
  });
}

function convertMp4ToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err));
  });
}

module.exports = {
  name: "play",
  alias: ["ytmp3", "ytmp4", "video"],
  execute: async (ctx) => {
    const { ryzu, from, msg, command, q, reply } = ctx
    if (!q) return reply(`Kirim link atau judul videonya!\nContoh: *.${command} kokoronashi*`)

    let tempMp4Path = null
    let tempMp3Path = null
    let sendAsFile = false
    let dlUrl = null
    let videoTitle = "Video"

    try {
      const isVideoFormat = (command === "video" || command === "ytmp4")
      const ONEPUNYA_KEY = process.env.ONEPUNYA_KEY || ""
      const BETA_KEY = process.env.BETABOTZ_KEY || process.env.BETA_KEY || ""

      let videoUrl = q
      const isLink = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^\s&]+)/)

      if (!isLink) {
        const search = await yts(q)
        const vid = search.videos[0]
        if (!vid) return reply("❌ Video tidak ditemukan.")
        videoUrl = vid.url
        videoTitle = vid.title
      } else {
        videoUrl = isLink[0]
      }

      await ryzu.sendMessage(from, { text: `⌛ Sedang memproses *${command.toUpperCase()}*...` }, { quoted: msg })

      // 1️⃣ Coba Siputzx SaveFrom + Redirect Solver (Gratis & No Key)
      try {
        console.log(`[SERVER] Mencoba Siputzx SaveFrom + Redirect Solver...`)
        const result = await getDirectYtUrl(videoUrl)
        dlUrl = result.url
        videoTitle = result.title
        
        if (!isVideoFormat) {
          const tempId = Math.random().toString(36).substring(2, 15)
          const tmpDir = path.join(__dirname, '../../tmp')
          if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
          
          tempMp4Path = path.join(tmpDir, `yt_${tempId}.mp4`)
          tempMp3Path = path.join(tmpDir, `yt_${tempId}.mp3`)
          
          console.log(`[SERVER] Mendownload MP4 untuk konversi audio...`)
          await downloadFile(dlUrl, tempMp4Path)
          console.log(`[SERVER] Mengonversi ke MP3...`)
          await convertMp4ToMp3(tempMp4Path, tempMp3Path)
          sendAsFile = true
        }
      } catch (e) {
        console.error(`[SERVER] Siputzx API / Converter Error:`, e.message)
      }

      // 2️⃣ Fallback ke Onepunya API jika Siputzx gagal
      if (!dlUrl && !sendAsFile) {
        try {
          let endpoint = ""
          if (command === "play") {
            endpoint = `https://onepunya.qzz.io/api/search/ytmusic_play?url=${encodeURIComponent(videoUrl)}&apikey=${ONEPUNYA_KEY}`
            console.log(`[SERVER] Mencoba Onepunya YT Music Play...`)
          } else if (command === "video") {
            endpoint = `https://onepunya.qzz.io/api/search/youtube?url=${encodeURIComponent(videoUrl)}&apikey=${ONEPUNYA_KEY}`
            console.log(`[SERVER] Mencoba Onepunya YouTube Search...`)
          } else if (command === "ytmp3" || command === "ytmp4") {
            endpoint = `https://onepunya.qzz.io/api/download/youtube?url=${encodeURIComponent(videoUrl)}&apikey=${ONEPUNYA_KEY}`
            console.log(`[SERVER] Mencoba Onepunya Download YouTube...`)
          }

          const oneRes = await axios.get(endpoint)
          if (oneRes.data.status) {
            const res = oneRes.data.result
            dlUrl = isVideoFormat ? (res.mp4 || res.video || res.url) : (res.mp3 || res.audio || res.url)
          }
        } catch (e) {
          console.error(`[SERVER] Onepunya API Error:`, e.message)
        }
      }

      // 3️⃣ Fallback ke Betabotz API jika Onepunya gagal
      let betabotzErrorMessage = null
      if (!dlUrl && !sendAsFile) {
        try {
          console.log(`[SERVER] Beralih ke Betabotz...`)
          const betaEndpoint = isVideoFormat ? "ytmp4" : "ytmp3"
          const betaRes = await axios.get(`https://api.betabotz.eu.org/api/download/${betaEndpoint}?url=${encodeURIComponent(videoUrl)}&apikey=${BETA_KEY}`)
          if (betaRes.data?.result) {
            dlUrl = isVideoFormat ? betaRes.data.result.mp4 : betaRes.data.result.mp3
          } else if (betaRes.data?.message && betaRes.data.message.includes('whitelist')) {
            betabotzErrorMessage = `⚠️ *IP Address Server/Bot Belum Diwhitelist!*\nIP Anda: *${betaRes.data.ip || 'tidak diketahui'}*\nSilakan whitelist IP tersebut di https://api.betabotz.eu.org/profile agar server Betabotz dapat digunakan.`
          }
        } catch (e) {
          console.error(`[SERVER] Betabotz Error:`, e.message)
          if (e.response?.data?.message && e.response.data.message.includes('whitelist')) {
            betabotzErrorMessage = `⚠️ *IP Address Server/Bot Belum Diwhitelist!*\nIP Anda: *${e.response.data.ip || 'tidak diketahui'}*\nSilakan whitelist IP tersebut di https://api.betabotz.eu.org/profile agar server Betabotz dapat digunakan.`
          }
        }
      }

      if (!dlUrl && !sendAsFile) {
        if (betabotzErrorMessage) {
          return reply(betabotzErrorMessage)
        }
        return reply("❌ Gagal mendapatkan link download. Semua server tidak merespon.")
      }

      // Kirim hasil download
      if (isVideoFormat) {
        await ryzu.sendMessage(from, {
          video: { url: dlUrl },
          caption: `✅ Selesai: *${videoTitle}*`
        }, { quoted: msg })
      } else {
        if (sendAsFile && tempMp3Path && fs.existsSync(tempMp3Path)) {
          await ryzu.sendMessage(from, {
            audio: fs.readFileSync(tempMp3Path),
            mimetype: "audio/mp4",
            fileName: `${videoTitle}.mp3`
          }, { quoted: msg })
        } else {
          await ryzu.sendMessage(from, {
            audio: { url: dlUrl },
            mimetype: "audio/mp4",
            fileName: `${videoTitle}.mp3`
          }, { quoted: msg })
        }
      }

    } catch (err) {
      console.error("PLAY ERROR:", err)
      reply("❌ Terjadi kesalahan sistem.")
    } finally {
      // Bersihkan file temp jika ada
      if (tempMp4Path && fs.existsSync(tempMp4Path)) {
        try { fs.unlinkSync(tempMp4Path) } catch(e) {}
      }
      if (tempMp3Path && fs.existsSync(tempMp3Path)) {
        try { fs.unlinkSync(tempMp3Path) } catch(e) {}
      }
    }
  }
}