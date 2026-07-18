const axios = require("axios")
const yts = require("yt-search")
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
    console.error('[SPOTIFY] Ummy API failed:', e.message);
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
                
  if (!videoObj) {
    throw new Error('Format MP4 tidak ditemukan.');
  }
  
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
  name: "spotify",
  alias: ["spotifydl", "sp", "spdl"],
  execute: async (ctx) => {
    const { ryzu, from, msg, q, reply } = ctx
    if (!q) return reply("Masukkan link Spotify!\nContoh: *.spotify https://open.spotify.com/track/4PTG3Z6ehGkBF3zI7YSpG0*")

    await ryzu.sendMessage(from, { text: "⌛ Sedang memproses lagu Spotify..." }, { quoted: msg })

    let tempMp4Path = null
    let tempMp3Path = null
    let title = "Spotify Song"
    let artist = "Various Artists"
    let videoUrl = null

    try {
      // 1️⃣ Dapatkan metadata judul & artis dari link Spotify secara langsung (HTML parsing)
      try {
        console.log(`[SPOTIFY] Mengambil metadata dari link...`)
        const res = await axios.get(q);
        const html = res.data;
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          const rawTitle = titleMatch[1].replace(' | Spotify', '').trim();
          const splitMatch = rawTitle.match(/(.+?)\s+-\s+(?:song|song and lyrics|album|single|playlist)\s+by\s+(.+)/i);
          if (splitMatch) {
            title = splitMatch[1].trim();
            artist = splitMatch[2].trim();
          } else {
            const parts = rawTitle.split(' - ');
            title = parts[0] ? parts[0].trim() : title;
            artist = parts[1] ? parts[1].trim() : artist;
          }
        }
      } catch (metaErr) {
        console.error("[SPOTIFY] Gagal memparsing metadata:", metaErr.message);
      }

      console.log(`[SPOTIFY] Menemukan lagu: "${title}" oleh "${artist}"`);

      // 2️⃣ Cari lagu tersebut di YouTube
      const searchQuery = `${artist} - ${title}`;
      try {
        console.log(`[SPOTIFY] Mencari di YouTube: "${searchQuery}"`);
        const search = await yts(searchQuery);
        const vid = search.videos[0];
        if (vid) {
          videoUrl = vid.url;
          console.log(`[SPOTIFY] Menemukan video YouTube: ${videoUrl}`);
        }
      } catch (searchErr) {
        console.error("[SPOTIFY] Gagal mencari di YouTube:", searchErr.message);
      }

      if (!videoUrl) {
        return reply("❌ Gagal menemukan lagu tersebut di YouTube.");
      }

      // 3️⃣ Unduh & Konversi ke MP3 secara lokal menggunakan SaveFrom SSE Solver
      console.log(`[SPOTIFY] Mendapatkan direct download link...`)
      const ytResult = await getDirectYtUrl(videoUrl);
      
      const tempId = Math.random().toString(36).substring(2, 15)
      const tmpDir = path.join(__dirname, '../../tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
      
      tempMp4Path = path.join(tmpDir, `spot_${tempId}.mp4`)
      tempMp3Path = path.join(tmpDir, `spot_${tempId}.mp3`)
      
      console.log(`[SPOTIFY] Mengunduh berkas media sementara...`)
      await downloadFile(ytResult.url, tempMp4Path);
      
      console.log(`[SPOTIFY] Mengonversi ke MP3...`)
      await convertMp4ToMp3(tempMp4Path, tempMp3Path);

      console.log(`[SPOTIFY] Mengirim audio ke user...`)
      await ryzu.sendMessage(from, {
        audio: { url: tempMp3Path },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        caption: `✅ *Spotify Downloader*\n\n📌 Judul: *${title}*\n👤 Artis: ${artist}`
      }, { quoted: msg })

    } catch (err) {
      console.error("[SPOTIFY ERROR]", err);
      reply(`❌ Gagal memproses: ${err.message || 'Error tidak diketahui'}`);
    } finally {
      // 4️⃣ Hapus berkas sementara
      if (tempMp4Path && fs.existsSync(tempMp4Path)) {
        try { fs.unlinkSync(tempMp4Path) } catch (e) {}
      }
      if (tempMp3Path && fs.existsSync(tempMp3Path)) {
        try { fs.unlinkSync(tempMp3Path) } catch (e) {}
      }
    }
  }
}
