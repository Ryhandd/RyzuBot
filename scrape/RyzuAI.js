const axios = require("axios");
const DeepSeekAI = require("./Deepseek");

async function RyzuAI(prompt) {

    // GROQ
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
                }
            }
        );

        return res.data?.choices?.[0]?.message?.content;

    } catch (err) {
        console.error("GROQ ERROR:", err.response?.data || err.message);
    }

    // OPENROUTER
    try {
        const res = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-r1",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.data?.choices?.[0]?.message?.content;

    } catch (err) {
        console.error("OPENROUTER ERROR:", err.response?.data || err.message);
    }

    // DEEPSEEK
    try {
        const res = await DeepSeekAI(prompt);
        if (res) return res;
    } catch (err) {
        console.error("DEEPSEEK ERROR:", err.message);
    }

    return null;
}

module.exports = RyzuAI;