import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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

export const talkToLeo = async (history) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: LEO_SYSTEM_PROMPT
  });
  const result = await model.generateContent(history);
  return result.response.text();
};
