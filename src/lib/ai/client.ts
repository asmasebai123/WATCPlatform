import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Client Google Gemini — gratuit jusqu'à 1500 req/jour.
 * Modèle par défaut : gemini-2.0-flash (rapide, qualité comparable à Claude Haiku)
 * Doc : https://ai.google.dev/gemini-api/docs
 */
const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY ?? "";

export const gemini = new GoogleGenerativeAI(apiKey);

export const AI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

export interface AIUsage {
  input: number;
  output: number;
}

export interface AIResult {
  text: string;
  usage: AIUsage;
}

/**
 * Wrapper unifié autour de Gemini qui renvoie du texte + usage.
 * Garde une interface proche de l'API Anthropic précédente.
 */
export async function generateText(params: {
  system: string;
  user: string;
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<AIResult> {
  const model = gemini.getGenerativeModel({
    model: AI_MODEL,
    systemInstruction: params.system,
    generationConfig: {
      maxOutputTokens: params.maxTokens ?? 2048,
      temperature: 0.7,
      responseMimeType: params.jsonMode ? "application/json" : "text/plain",
    },
  });

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: params.user }] }],
  });

  const text = res.response.text() ?? "";
  const meta = res.response.usageMetadata;
  return {
    text,
    usage: {
      input: meta?.promptTokenCount ?? 0,
      output: meta?.candidatesTokenCount ?? 0,
    },
  };
}
