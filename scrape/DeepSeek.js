const axios = require("axios");

async function DeepSeekAI(prompt) {
    try {
        const res = await axios.post(
            "https://api.deepseek.com/chat/completions",
            {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt }
                ],
                stream: false
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        return res.data.choices[0].message.content;

    } catch (err) {
        console.error("DEEPSEEK ERROR:", err.response?.data || err.message);
        return null;
    }
}

module.exports = DeepSeekAI;