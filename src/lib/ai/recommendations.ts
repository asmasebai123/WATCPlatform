import { generateText } from "./client";

export const RECOMMENDATION_SYSTEM = `Tu es un conseiller pédagogique expert.
Tu recommandes des formations en ligne, cours et ressources concrètes pour un étudiant tunisien en informatique ou électronique.

Règles :
- Propose 6 à 8 formations.
- Chaque formation doit **cibler une lacune ou un centre d'intérêt** précis de l'étudiant.
- Priorise les ressources GRATUITES ou peu coûteuses (YouTube, OpenClassrooms, Coursera audit, freeCodeCamp, documentation officielle).
- Varie les formats : vidéo, cours interactif, documentation, bootcamp, certification.
- Langue : français de préférence, anglais si la meilleure ressource existe en anglais.

Réponds STRICTEMENT en JSON (pas de markdown) au format :
{
  "recommendations": [
    {
      "title": "Titre formation",
      "provider": "OpenClassrooms | Coursera | YouTube | freeCodeCamp | ...",
      "durationHours": 10,
      "level": "DEBUTANT | INTERMEDIAIRE | AVANCE",
      "format": "VIDEO | COURS | DOC | BOOTCAMP | CERTIFICATION",
      "free": true,
      "why": "Pourquoi cette formation aide précisément l'étudiant (1-2 phrases)",
      "targets": "lacune ou intérêt ciblé (ex: 'Améliorer son anglais technique')",
      "url": "lien direct (ou lien de recherche google si URL inconnue)",
      "tags": ["React", "Frontend"]
    }
  ]
}`;

export interface RecommendationInput {
  filiere?: string | null;
  diplomaType?: string | null;
  studyLevel?: string | null;
  frenchLevel?: string | null;
  englishLevel?: string | null;
  interests?: string | null;
  improvements?: string[];
  skills?: { name: string; level: string }[];
  testInsights?: {
    totalScore?: number | null;
    technicalScore?: number | null;
    frenchScore?: number | null;
    englishScore?: number | null;
    softScore?: number | null;
    axesAmelioration?: string[];
    pointsForts?: string[];
  };
}

export interface Recommendation {
  title: string;
  provider: string;
  durationHours: number;
  level: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  format: "VIDEO" | "COURS" | "DOC" | "BOOTCAMP" | "CERTIFICATION";
  free: boolean;
  why: string;
  targets: string;
  url: string;
  tags: string[];
}

export async function generateRecommendations(input: RecommendationInput): Promise<Recommendation[]> {
  const userPrompt = `Voici le profil de l'étudiant :

FORMATION
- Filière : ${input.filiere ?? "non précisée"}
- Diplôme visé : ${input.diplomaType ?? "—"}
- Niveau d'étude : ${input.studyLevel ?? "—"}

CENTRES D'INTÉRÊT
${input.interests ?? "Non précisés"}

COMPÉTENCES ACTUELLES
${(input.skills ?? []).map((s) => `- ${s.name} (${s.level})`).join("\n") || "Aucune compétence déclarée"}

NIVEAU LANGUES
- Français : ${input.frenchLevel ?? "?"}
- Anglais : ${input.englishLevel ?? "?"}

AXES D'AMÉLIORATION (auto-déclarés)
${(input.improvements ?? []).map((i) => `- ${i}`).join("\n") || "Aucun"}

RÉSULTATS DU TEST IA (à prioriser fortement)
- Score global : ${input.testInsights?.totalScore ?? "non passé"}/100
- Technique : ${input.testInsights?.technicalScore ?? "?"}/100
- Français : ${input.testInsights?.frenchScore ?? "?"}/100
- Anglais : ${input.testInsights?.englishScore ?? "?"}/100
- Soft skills : ${input.testInsights?.softScore ?? "?"}/100

LACUNES IDENTIFIÉES PAR L'IA
${(input.testInsights?.axesAmelioration ?? []).map((a) => `- ${a}`).join("\n") || "—"}

POINTS FORTS DÉTECTÉS
${(input.testInsights?.pointsForts ?? []).map((p) => `- ${p}`).join("\n") || "—"}

Recommande maintenant 6 à 8 formations ciblées qui COMBINENT :
1. Les lacunes identifiées (priorité haute)
2. Les centres d'intérêt déclarés
3. La progression naturelle depuis le niveau actuel`;

  const { text } = await generateText({
    system: RECOMMENDATION_SYSTEM,
    user: userPrompt,
    maxTokens: 4096,
    jsonMode: true,
  });

  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as { recommendations: Recommendation[] };
    return parsed.recommendations ?? [];
  } catch {
    return [];
  }
}
