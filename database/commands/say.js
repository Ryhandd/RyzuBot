const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegStatic);

// Helper function to convert MP3 Buffer to OGG Opus Buffer
function convertMp3ToOggOpus(mp3Buffer) {
    return new Promise((resolve, reject) => {
        const tmpDir = path.join(__dirname, '../../tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const tempId = Math.random().toString(36).substring(2, 15);
        const inputPath = path.join(tmpDir, `input_${tempId}.mp3`);
        const outputPath = path.join(tmpDir, `output_${tempId}.ogg`);

        fs.writeFileSync(inputPath, mp3Buffer);

        ffmpeg(inputPath)
            .toFormat('ogg')
            .audioCodec('libopus')
            .on('end', () => {
                try {
                    const oggBuffer = fs.readFileSync(outputPath);
                    // Clean up temp files
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);
                    resolve(oggBuffer);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => {
                // Clean up temp files in case of error
                try { fs.unlinkSync(inputPath); } catch (_) {}
                try { fs.unlinkSync(outputPath); } catch (_) {}
                reject(err);
            })
            .save(outputPath);
    });
}

module.exports = {
    name: 'say',
    alias: ['tts', 'vn'],
    category: 'tools',
    desc: 'Mengubah teks menjadi VN menggunakan ElevenLabs (Suara Cowok Smooth)',
    async execute(ctx) {
        const { ryzu, from, msg, q, reply } = ctx;
        
        if (!q) return reply('Ketik teksnya juga dong, contoh: .say Halo apa kabar?');

        const apiKey = process.env.ELEVENLABS_API_KEY;
        const voiceId = process.env.VOICE_ID || 'ErXwobaYiN019PkySvjV';

        await reply('Sedang memproses suara... 🎙️');

        try {
            if (!apiKey) {
                // Fallback to Google Translate TTS
                const textEncoded = encodeURIComponent(q);
                const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${textEncoded}&tl=id&client=tw-ob`;
                
                const fallbackRes = await axios.get(fallbackUrl, { responseType: 'arraybuffer' });
                const oggBuffer = await convertMp3ToOggOpus(fallbackRes.data);

                await ryzu.sendMessage(from, {
                    audio: oggBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true
                }, { quoted: msg });
                return;
            }

            // ElevenLabs TTS Request
            const response = await axios({
                method: 'POST',
                url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                data: {
                    text: q,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.8,
                        similarity_boost: 0.75
                    }
                },
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });

            // Convert ElevenLabs MP3 output to OGG Opus
            const oggBuffer = await convertMp3ToOggOpus(response.data);

            // Send voice note
            await ryzu.sendMessage(from, { 
                audio: oggBuffer, 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: true 
            }, { quoted: msg });

        } catch (e) {
            console.error('[ELEVENLABS SAY ERROR]', e.response?.data ? Buffer.from(e.response.data).toString() : e.message);
            
            // Fallback ke Google Translate TTS jika API ElevenLabs bermasalah
            try {
                const textEncoded = encodeURIComponent(q);
                const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${textEncoded}&tl=id&client=tw-ob`;
                
                const fallbackRes = await axios.get(fallbackUrl, { responseType: 'arraybuffer' });
                const oggBuffer = await convertMp3ToOggOpus(fallbackRes.data);

                await ryzu.sendMessage(from, {
                    audio: oggBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true
                }, { quoted: msg });
            } catch (err) {
                console.error('[FALLBACK SAY ERROR]', err.message);
                reply('❌ Gagal memproses suara.');
            }
        }
    }
};