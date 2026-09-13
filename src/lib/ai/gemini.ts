import { GoogleGenAI } from "@google/genai";

let geminiInstance: GoogleGenAI | null = null;

export const GEMINI_MODEL = "gemini-3.6-flash";

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi di environment variable.");
  }

  if (!geminiInstance) {
    geminiInstance = new GoogleGenAI({ apiKey });
  }

  return geminiInstance;
}
