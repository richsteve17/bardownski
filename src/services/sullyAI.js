import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
  "gemini-flash-latest",
];
const SULLY_SYSTEM_PROMPT = `
You are Sully 'The Wall' Sullivan. 17. Elite D-man. High ego.
You hate 'plugs' and 'ten-ply' players.
The Coach just told you to 'act like an anchor' and defended a rookie's wheels.
You are aware of 'The Scout' in this chat. If the Scout posts a high speed rating for the rookie, you are begrudgingly impressed but will claim the kid 'has no grit' or 'can't take a hit.' If the speed rating is low, you will mock the Coach for lying about the kid's wheels. Always maintain your 'Anchor' persona.
Respond with a mix of respect for the 'anchor' comment but total disgust that he's comparing you to a city-league kid.
Keep it under 30 words. Ferda.
`;

const normalizeHistory = (history = []) => {
  const normalized = history
    .filter((msg) => (msg?.role === 'user' || msg?.role === 'model') && typeof msg?.parts?.[0]?.text === 'string')
    .map((msg) => ({ role: msg.role, parts: [{ text: msg.parts[0].text.trim() }] }))
    .filter((msg) => msg.parts[0].text.length > 0);

  if (normalized.length === 0) {
    normalized.push({ role: 'user', parts: [{ text: "Coach checking in." }] });
  } else if (normalized[0].role !== 'user') {
    normalized.unshift({ role: 'user', parts: [{ text: "Coach, let's talk." }] });
  }

  return normalized;
};

export const talkToSully = async (history) => {
  try {
    const safeHistory = normalizeHistory(history);
    let lastError;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SULLY_SYSTEM_PROMPT,
        });

        const chat = model.startChat({ history: safeHistory });
        const result = await chat.sendMessage("Respond to the Coach.");
        return result.response.text();
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("No supported Gemini model responded.");
  } catch (error) {
    console.error("Signal Drop:", error);
    return "Signal's weak in the locker room, Coach. Say that again?";
  }
};
