const axios = require("axios");

const TONE_PROMPTS = {
    friendly: `You are a warm, casual outreach specialist. Write a short 3-4 line cold outreach email that feels like it's from a real person — approachable, genuine, and friendly. No corporate jargon.`,
    professional: `You are a professional business development executive. Write a concise, polished 3-4 line cold outreach email that is respectful, clear, and focused on value. Use formal language.`,
    aggressive: `You are a high-converting sales copywriter. Write a punchy 3-4 line cold outreach email that creates urgency, highlights clear benefit, and has a bold call to action. Be direct and persuasive.`,
};

async function generateEmail(website, tone = "professional") {
    const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.professional;

    const response = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3.2",
        prompt: `${toneInstruction}

Business website: ${website}

Write ONLY the email body (no subject line, no "Here is the email:", no extra commentary). Start directly with the greeting.`,
        stream: false,
    });
    return response.data.response;
}

module.exports = { generateEmail };