import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
  "gemini-flash-latest",
];

const DEFAULT_PRESS_MODS = { swaggerMod: 0, trustMod: 0 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const sanitizeMods = (mods) => ({
  swaggerMod: clamp(Number(mods?.swaggerMod) || 0, -100, 100),
  trustMod: clamp(Number(mods?.trustMod) || 0, -100, 100),
});

const extractJsonObject = (rawText = "") => {
  const direct = rawText.trim();
  if (direct.startsWith("{") && direct.endsWith("}")) {
    return direct;
  }

  const fencedMatch = direct.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    const candidate = fencedMatch[1].trim();
    if (candidate.startsWith("{") && candidate.endsWith("}")) {
      return candidate;
    }
  }

  const start = direct.indexOf("{");
  const end = direct.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return direct.slice(start, end + 1);
  }

  return "";
};

const parsePressMods = (rawText = "") => {
  const jsonChunk = extractJsonObject(rawText);
  if (jsonChunk) {
    try {
      return sanitizeMods(JSON.parse(jsonChunk));
    } catch {
      // Fall through to regex parsing.
    }
  }

  const swaggerMatch = rawText.match(/swaggerMod[^-\d]*(-?\d+)/i);
  const trustMatch = rawText.match(/trustMod[^-\d]*(-?\d+)/i);
  if (swaggerMatch || trustMatch) {
    return sanitizeMods({
      swaggerMod: swaggerMatch ? Number(swaggerMatch[1]) : 0,
      trustMod: trustMatch ? Number(trustMatch[1]) : 0,
    });
  }

  return DEFAULT_PRESS_MODS;
};

export const judgePressResponse = async (question, answer, gameStats = {}) => {
  try {
    const safeStats = {
      sullyHeat: Number(gameStats?.sullyHeat) || 0,
      rookieTaps: Number(gameStats?.rookieTaps) || 0,
    };

    const systemInstruction = `
You are a cynical hockey media analyst.
Analyze the Coach's answer to a press question.
Game Context: Sully Heat is ${safeStats.sullyHeat}, Rookie Taps were ${safeStats.rookieTaps}.
If the Coach is authentic and 'Rich Legacy' (tough but fair), return {"swaggerMod":15,"trustMod":5}.
If the Coach is 'Ten-Ply' (soft, making excuses), return {"swaggerMod":-10,"trustMod":-10}.
If the Coach is a 'Heel' (arrogant, disrespectful), return {"swaggerMod":25,"trustMod":-15}.
Return JSON only with keys swaggerMod and trustMod.
`;

    let lastError;
    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        const result = await model.generateContent(
          `Question: ${question}\nAnswer: ${answer}\nReturn only JSON.`
        );

        return parsePressMods(result.response.text());
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("No supported Gemini model responded.");
  } catch (error) {
    console.error("Press Feed Jammed:", error);
    return DEFAULT_PRESS_MODS;
  }
};
