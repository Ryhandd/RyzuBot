const axios = require("axios");
const DeepSeekAI = require("./Deepseek");

async function RyzuAI(prompt) {
    // SIPUTZX DEEPSEEK R1
    try {
        const res = await axios.get(`https://api.siputzx.my.id/api/ai/deepseekr1?prompt=${encodeURIComponent(prompt)}`);
        if (res.data?.status && res.data?.data?.response) {
            return res.data.data.response;
        }
    } catch (err) {
        console.error("SIPUTZX DEEPSEEKR1 ERROR:", err.message);
    }

    // SIPUTZX GPTOSS120B
    try {
        const res = await axios.get(`https://api.siputzx.my.id/api/ai/gptoss120b?prompt=${encodeURIComponent(prompt)}`);
        if (res.data?.status && res.data?.data?.response) {
            return res.data.data.response;
        }
    } catch (err) {
        console.error("SIPUTZX GPTOSS120B ERROR:", err.message);
    }

    // SIPUTZX QWQ32B
    try {
        const res = await axios.get(`https://api.siputzx.my.id/api/ai/qwq32b?prompt=${encodeURIComponent(prompt)}`);
        if (res.data?.status && res.data?.data?.response) {
            return res.data.data.response;
        }
    } catch (err) {
        console.error("SIPUTZX QWQ32B ERROR:", err.message);
    }

    // GROQ (Fallback)
    try {
        const res = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
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

    // OPENROUTER (Fallback)
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

    // DEEPSEEK (Fallback)
    try {
        const res = await DeepSeekAI(prompt);
        if (res) return res;
    } catch (err) {
        console.error("DEEPSEEK ERROR:", err.message);
    }

    return null;
}

module.exports = RyzuAI;