import { GoogleGenAI, type ContentListUnion } from "@google/genai";

let geminiInstance: GoogleGenAI | null = null;

export const GEMINI_MODEL = "gemini-3.6-flash";
export const GEMINI_FALLBACK_MODEL = "gemini-3.1-flash-lite";

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

export interface GenerateWithFallbackParams {
  contents: ContentListUnion;
  systemInstruction: string;
  maxOutputTokens?: number;
  temperature?: number;
  abortSignal?: AbortSignal;
}

/**
 * Executes Gemini content generation with high-availability model fallback and
 * thinkingBudget=0 to prevent reasoning token bloat and JSON truncation.
 */
export async function generateContentWithFallback(
  params: GenerateWithFallbackParams
): Promise<string> {
  const ai = getGeminiClient();
  const models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL];
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: "application/json",
          temperature: params.temperature ?? 0.1,
          maxOutputTokens: params.maxOutputTokens ?? 1024,
          thinkingConfig: { thinkingBudget: 0 },
          abortSignal: params.abortSignal,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[GEMINI_MODEL_RETRY] Model ${model} encountered an issue, trying fallback:`, err);
    }
  }

  throw lastError || new Error("Gagal menerima respon dari layanan AI.");
}
