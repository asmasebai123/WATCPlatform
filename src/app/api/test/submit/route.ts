import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { evaluateAnswers } from "@/lib/ai/evaluator";
import { generateAdminReport, generateStudentReport } from "@/lib/ai/reports";

const schema = z.object({
  sessionId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      value: z.string().nullable(),
      timeSpentSec: z.number().int().min(0).max(60).default(30),
      timedOut: z.boolean().optional(),
    })
  ),
});

/**
 * Soumission d'un test — §4.5
 * 1. Enregistre les réponses
 * 2. Corrige les QCM/TrueFalse automatiquement
 * 3. Appelle Claude pour scorer les réponses ouvertes
 * 4. Génère les 2 rapports
 */
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = schema.parse(await req.json());
  const testSession = await prisma.testSession.findUnique({
    where: { id: body.sessionId },
    include: { questions: true },
  });
  if (!testSession || testSession.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (testSession.status === "SUBMITTED" || testSession.status === "EVALUATED") {
    return NextResponse.json({ error: "Test déjà soumis." }, { status: 400 });
  }

  // 1) Enregistrer les réponses
  await Promise.all(
    body.answers.map((a) =>
      prisma.answer.upsert({
        where: { questionId: a.questionId },
        create: {
          sessionId: testSession.id,
          questionId: a.questionId,
          value: a.value,
          timeSpentSec: a.timeSpentSec,
          timedOut: !!a.timedOut,
        },
        update: {
          value: a.value,
          timeSpentSec: a.timeSpentSec,
          timedOut: !!a.timedOut,
        },
      })
    )
  );

  // 2) Correction déterministe (QCM / True/False)
  const questions = testSession.questions;
  const openQuestions = questions.filter((q) =>
    ["OPEN_SHORT", "SCENARIO", "CODE_COMPLETION", "LANG_READING"].includes(q.type)
  );

  for (const q of questions) {
    const answer = body.answers.find((a) => a.questionId === q.id);
    const value = answer?.value?.trim() ?? "";
    let isCorrect: boolean | null = null;
    let aiScore: number | null = null;
    if (q.type === "QCM" || q.type === "TRUE_FALSE" || q.type === "LANG_GRAMMAR" || q.type === "LANG_VOCAB") {
      if (q.correctAnswer) {
        isCorrect = value.toUpperCase() === q.correctAnswer.toUpperCase();
        aiScore = isCorrect ? 100 : 0;
      }
    }
    await prisma.answer.update({
      where: { questionId: q.id },
      data: { isCorrect, aiScore },
    });
  }

  // 3) Réponses ouvertes → Claude
  if (openQuestions.length > 0) {
    const evalItems = openQuestions.map((q) => {
      const ans = body.answers.find((a) => a.questionId === q.id);
      return {
        questionId: q.id,
        prompt: q.prompt,
        expected: q.correctAnswer ?? null,
        keywords: (q.correctData as { keywords?: string[] } | null)?.keywords ?? [],
        userAnswer: ans?.value ?? "",
        type: q.type,
      };
    });

    try {
      const results = await evaluateAnswers(evalItems);
      for (const r of results) {
        await prisma.answer.update({
          where: { questionId: r.questionId },
          data: { aiScore: r.score, aiFeedback: r.feedback, isCorrect: r.isCorrect },
        });
      }
    } catch (err) {
      console.error("Évaluation ouverte KO:", err);
    }
  }

  // 4) Scores agrégés
  const allAnswers = await prisma.answer.findMany({
    where: { sessionId: testSession.id },
    include: { question: true },
  });
  const aggregate = (section: string) => {
    const qs = allAnswers.filter((a) => a.question.section === section);
    if (qs.length === 0) return 0;
    const sum = qs.reduce((s, a) => s + (a.aiScore ?? 0), 0);
    return Math.round(sum / qs.length);
  };
  const technicalScore = aggregate("TECHNICAL");
  const frenchScore = aggregate("FRENCH");
  const englishScore = aggregate("ENGLISH");
  const softScore = aggregate("SOFT_SKILLS");
  const totalScore = Math.round((technicalScore * 0.5 + frenchScore * 0.15 + englishScore * 0.15 + softScore * 0.2));
  const level = totalScore >= 80 ? "Senior" : totalScore >= 55 ? "Mid" : "Junior";

  await prisma.testSession.update({
    where: { id: testSession.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      totalScore,
      technicalScore,
      frenchScore,
      englishScore,
      softScore,
      level,
    },
  });

  // 5) Rapports IA
  const user = await prisma.user.findUnique({
    where: { id: testSession.userId },
    include: { profile: { include: { skills: { include: { skill: true } } } } },
  });

  const domainBreakdown: { skill: string; correct: number; total: number }[] = [];
  const skillSet = new Map<string, { correct: number; total: number }>();
  for (const a of allAnswers) {
    if (a.question.section !== "TECHNICAL") continue;
    const skill = a.question.domainSkill ?? "generic";
    const entry = skillSet.get(skill) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (a.isCorrect) entry.correct += 1;
    skillSet.set(skill, entry);
  }
  for (const [skill, data] of skillSet.entries()) {
    domainBreakdown.push({ skill, correct: data.correct, total: data.total });
  }

  const reportInput = {
    student: {
      firstName: user?.firstName,
      filiere: user?.profile?.filiere,
      diplomaType: user?.profile?.diplomaType,
      studyLevel: user?.profile?.studyLevel,
    },
    sessionSummary: {
      totalQuestions: allAnswers.length,
      technicalScore,
      frenchScore,
      englishScore,
      softScore,
      domainBreakdown,
      openAnswers: allAnswers
        .filter((a) => ["OPEN_SHORT", "SCENARIO"].includes(a.question.type))
        .map((a) => ({
          prompt: a.question.prompt,
          answer: a.value ?? "",
          score: a.aiScore ?? 0,
          feedback: a.aiFeedback ?? "",
        })),
    },
  };

  try {
    const [adminReport, studentReport] = await Promise.all([
      generateAdminReport(reportInput),
      generateStudentReport(reportInput),
    ]);

    await prisma.$transaction([
      prisma.report.create({
        data: {
          userId: testSession.userId,
          sessionId: testSession.id,
          kind: "ADMIN_DETAILED",
          content: adminReport,
        },
      }),
      prisma.report.create({
        data: {
          userId: testSession.userId,
          sessionId: testSession.id,
          kind: "STUDENT_SIMPLE",
          content: studentReport,
        },
      }),
      prisma.testSession.update({
        where: { id: testSession.id },
        data: { status: "EVALUATED", evaluatedAt: new Date() },
      }),
    ]);
  } catch (err) {
    console.error("Rapports IA KO:", err);
  }

  return NextResponse.json({ ok: true, sessionId: testSession.id });
}
