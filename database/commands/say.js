const axios = require('axios');

module.exports = {
    name: 'say',
    alias: ['tts', 'vn'],
    category: 'tools',
    desc: 'Mengubah teks menjadi VN menggunakan ElevenLabs',
    async run({ msg, conn, text }) {
        if (!text) return msg.reply('Ketik teksnya juga dong, contoh: .say Halo apa kabar?');

        const apiKey = process.env.ELEVENLABS_API_KEY;
        const voiceId = process.env.VOICE_ID;

        if (!apiKey || !voiceId) return msg.reply('API Key atau Voice ID belum diatur di .env!');

        await msg.reply('Sedang memproses suara... 🎙️');

        try {
            const response = await axios({
                method: 'POST',
                url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                data: {
                    text: text,
                    model_id: 'eleven_multilingual_v2', // Model terbaik untuk Bahasa Indonesia
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                },
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });

            // Mengirim hasil buffer audio sebagai Voice Note (PTT)
            await conn.sendMessage(msg.from, { 
                audio: Buffer.from(response.data), 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            msg.reply('Waduh, gagal pas panggil ElevenLabs. Cek kuota atau API Key lu.');
        }
    }
};