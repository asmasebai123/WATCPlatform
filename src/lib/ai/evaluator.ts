import { generateText } from "./client";
import { EVALUATION_SYSTEM } from "./prompts";

export interface EvalInput {
  questionId: string;
  prompt: string;
  expected?: string | null;
  keywords?: string[];
  userAnswer: string;
  type: string;
}

export interface EvalOutput {
  questionId: string;
  score: number;
  isCorrect: boolean;
  feedback: string;
}

export async function evaluateAnswers(items: EvalInput[]): Promise<EvalOutput[]> {
  if (items.length === 0) return [];

  const { text } = await generateText({
    system: EVALUATION_SYSTEM,
    user: `Évalue ces réponses d'étudiants :\n${JSON.stringify(items, null, 2)}`,
    maxTokens: 3000,
    jsonMode: true,
  });

  try {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as { results: EvalOutput[] };
    return parsed.results ?? [];
  } catch {
    return [];
  }
}
