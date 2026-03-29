const axios = require("axios");

async function RyzuAI(prompt) {
    try {
        const res = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-70b-8192",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        if (res.data?.choices?.[0]?.message?.content) {
            return res.data.choices[0].message.content;
        }
    } catch (err) {
        console.error("GROQ ERROR:", err.response?.data || err.message);
    }

    try {
        const res = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        if (res.data?.choices?.[0]?.message?.content) {
            return res.data.choices[0].message.content;
        }
    } catch (err) {
        console.error("OPENROUTER ERROR:", err.response?.data || err.message);
    }

    try {
        const res = await axios.post(
            "https://api.deepseek.com/chat/completions",
            {
                model: "deepseek-chat",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        if (res.data?.choices?.[0]?.message?.content) {
            return res.data.choices[0].message.content;
        }
    } catch (err) {
        console.error("DEEPSEEK ERROR:", err.response?.data || err.message);
    }

    return "⚠️ AI lagi error semua. Coba lagi nanti.";
}

module.exports = RyzuAI;