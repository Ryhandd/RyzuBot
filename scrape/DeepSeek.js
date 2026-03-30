const OpenAI = require("openai");

const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
});

async function DeepSeekAI(prompt) {
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
        });

        return completion.choices[0].message.content;

    } catch (err) {
        console.error("DEEPSEEK SDK ERROR:", err.message);
        return null;
    }
}

module.exports = DeepSeekAI;