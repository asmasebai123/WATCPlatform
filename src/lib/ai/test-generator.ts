import { generateText } from "./client";
import {
  TEST_GENERATION_SYSTEM,
  buildTestGenerationPrompt,
  type ProfileSnapshot,
} from "./prompts";

export interface GeneratedQuestion {
  section: "TECHNICAL" | "FRENCH" | "ENGLISH" | "SOFT_SKILLS";
  type:
    | "QCM"
    | "TRUE_FALSE"
    | "CODE_COMPLETION"
    | "OPEN_SHORT"
    | "SCENARIO"
    | "LANG_READING"
    | "LANG_VOCAB"
    | "LANG_GRAMMAR"
    | "SOFT_LOGIC"
    | "SOFT_BEHAVIOR";
  prompt: string;
  options?: Record<string, string> | null;
  correctAnswer?: string | null;
  correctData?: { keywords?: string[] } | null;
  domainSkill?: string | null;
  points?: number;
}

export async function generateTest(
  profile: ProfileSnapshot
): Promise<{ questions: GeneratedQuestion[]; usage: { input: number; output: number } }> {
  const { text, usage } = await generateText({
    system: TEST_GENERATION_SYSTEM,
    user: buildTestGenerationPrompt(profile),
    maxTokens: 8192,
    jsonMode: true,
  });

  if (!text) throw new Error("Réponse Gemini vide.");
  const json = extractJson(text);
  return {
    questions: json.questions as GeneratedQuestion[],
    usage,
  };
}

/** Extrait un JSON depuis la réponse IA, tolère les markdown fences + JSON tronqué. */
export function extractJson(text: string): { questions: GeneratedQuestion[] } {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // 1. Essai direct
  try {
    return JSON.parse(cleaned);
  } catch {
    // 2. JSON tronqué : on extrait les questions complètes
    const match = cleaned.match(/"questions"\s*:\s*\[([\s\S]*)/);
    if (!match) throw new Error("Réponse IA non parseable (pas de champ 'questions').");

    const arrayBody = match[1];
    const items: string[] = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escape = false;

    for (let i = 0; i < arrayBody.length; i++) {
      const ch = arrayBody[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') inString = !inString;
      if (inString) continue;
      if (ch === "{") { if (depth === 0) start = i; depth++; }
      else if (ch === "}") {
        depth--;
        if (depth === 0 && start >= 0) {
          items.push(arrayBody.slice(start, i + 1));
          start = -1;
        }
      }
    }

    const questions: GeneratedQuestion[] = [];
    for (const raw of items) {
      try { questions.push(JSON.parse(raw)); } catch { /* skip */ }
    }
    if (questions.length === 0) throw new Error("Aucune question valide dans la réponse IA.");
    console.warn(`[AI] JSON tronqué — ${questions.length} questions récupérées sur ${items.length}.`);
    return { questions };
  }
}
