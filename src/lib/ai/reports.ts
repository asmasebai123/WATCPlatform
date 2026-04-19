import { generateText } from "./client";
import { REPORT_ADMIN_SYSTEM, REPORT_STUDENT_SYSTEM } from "./prompts";

export interface ReportInput {
  student: {
    firstName?: string | null;
    filiere?: string | null;
    diplomaType?: string | null;
    studyLevel?: string | null;
  };
  sessionSummary: {
    totalQuestions: number;
    technicalScore: number;
    frenchScore: number;
    englishScore: number;
    softScore: number;
    domainBreakdown: { skill: string; correct: number; total: number }[];
    openAnswers?: { prompt: string; answer: string; score: number; feedback: string }[];
  };
}

export async function generateAdminReport(input: ReportInput) {
  const { text } = await generateText({
    system: REPORT_ADMIN_SYSTEM,
    user: JSON.stringify(input),
    maxTokens: 2500,
    jsonMode: true,
  });
  return parseJsonBlock(text);
}

export async function generateStudentReport(input: ReportInput) {
  const { text } = await generateText({
    system: REPORT_STUDENT_SYSTEM,
    user: JSON.stringify(input),
    maxTokens: 1500,
    jsonMode: true,
  });
  return parseJsonBlock(text);
}

function parseJsonBlock(text: string) {
  if (!text) return {};
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { raw: text };
  }
}
