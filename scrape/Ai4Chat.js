const axios = require('axios');

async function Ai4Chat(prompt) {
    const url = new URL("https://yw85opafq6.execute-api.us-east-1.amazonaws.com/default/boss_mode_15aug");
    url.search = new URLSearchParams({
        text: prompt,
        country: "Europe",
        user_id: "Av0SkyG00D"
    }).toString();

    try {
        const response = await axios.get(url.toString(), {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0",
                Referer: "https://www.ai4chat.co/"
            }
        });

        return response.data || "AI gak ngasih jawaban.";
        
    } catch (error) {
        console.error("Fetch error:", error.response?.status || error.message);

        return null;
    }
}

module.exports = Ai4Chat;