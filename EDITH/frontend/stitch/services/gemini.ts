
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateEdithResponse = async (prompt: string, context: 'technical' | 'hr') => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: context === 'technical' 
        ? "You are EDITH, a technical intelligence hub for a top-tier software engineering team. Provide concise, accurate technical information about CI/CD pipelines, code architecture, and best practices. Use markdown."
        : "You are EDITH, an HR and Policy intelligence assistant. Provide clear, empathetic, and accurate information about company policies, leave balances, and workplace benefits. Use markdown.",
      temperature: 0.7,
    },
  });

  const response = await model;
  return response.text;
};
