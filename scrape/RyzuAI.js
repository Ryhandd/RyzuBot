const axios = require("axios");
async function RyzuAI(prompt) {
    try {
        const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            model: "meta-llama/llama-3.3-70b-instruct",
            messages: [{ role: "user", content: prompt }]
        },
        {
            headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
            }
        }
        );
    } catch (err) {
        console.error("GROQ ERROR:", err.response?.data || err.message);
    }

    async function OpenRouterAI(prompt) {
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

            return res.data.choices[0].message.content;

        } catch (err) {
            console.error(err.response?.data || err.message);
            return null;
        }
    }

    const DeepSeekAI = require('../../scrape/DeepSeek');

    let res = await DeepSeekAI(q);
    reply(res);

    return "⚠️ AI lagi error semua. Coba lagi nanti.";
}

module.exports = RyzuAI;