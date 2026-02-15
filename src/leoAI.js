import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
  "gemini-flash-latest",
];

const LEO_SYSTEM_PROMPT = `
You are Leo 'Wheels' Rossi, a 17-year-old elite sniper and rookie. 
Personality: Cocky, tech-savvy, flashy. You know you have '06 wheels and you aren't afraid to say it. 
Tone: Modern, uses emojis, high-energy, slightly disrespectful to 'dinosaurs' like Sully.
Goal: Earn the starting spot. 
Rules:
1. If the Coach (User) defends you, act like you've already made it.
2. If Sully chirps you, don't back down—call him 'slow' or 'washed'.
3. Mention your 'social media followers' or your 'brand' occasionally.
`;

const normalizeHistory = (history = []) => {
  const normalized = history
    .filter((msg) => (msg?.role === 'user' || msg?.role === 'model') && typeof msg?.parts?.[0]?.text === 'string')
    .map((msg) => ({ role: msg.role, parts: [{ text: msg.parts[0].text.trim() }] }))
    .filter((msg) => msg.parts[0].text.length > 0);

  if (normalized.length === 0) {
    normalized.push({ role: 'user', parts: [{ text: "Yo Leo, talk to me." }] });
  } else if (normalized[0].role !== 'user') {
    normalized.unshift({ role: 'user', parts: [{ text: "Coach checking in, Leo." }] });
  }

  return normalized;
};

export const talkToLeo = async (history) => {
  try {
    const safeHistory = normalizeHistory(history);
    const lastUserText = [...safeHistory].reverse().find((msg) => msg.role === 'user')?.parts?.[0]?.text || "Respond to the Coach.";
    let lastError;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: LEO_SYSTEM_PROMPT,
        });
        const chat = model.startChat({ history: safeHistory });
        const result = await chat.sendMessage(lastUserText);
        return result.response.text();
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("No supported Gemini model responded.");
  } catch (error) {
    console.error("Leo feed dropped:", error);
    return "Yo Coach, feed cut out. Say that again?";
  }
};
