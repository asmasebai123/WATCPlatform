import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { generateRecommendations, type RecommendationInput } from "@/lib/ai/recommendations";

/**
 * POST /api/formations
 *
 * Génère des recommandations de formation adaptées au profil + aux résultats
 * du dernier test IA évalué (axes d'amélioration + points forts).
 */
export async function POST() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 1. Profil + compétences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: { skills: { include: { skill: true } } },
      },
    },
  });

  if (!user?.profile) {
    return NextResponse.json(
      { error: "Profil incomplet — complète d'abord ton profil." },
      { status: 400 }
    );
  }

  // 2. Dernier test évalué + rapport étudiant
  const latestTest = await prisma.testSession.findFirst({
    where: { userId: session.user.id, status: "EVALUATED" },
    orderBy: { evaluatedAt: "desc" },
    include: { reports: true },
  });

  const studentReport = latestTest?.reports.find((r) => r.kind === "STUDENT_SIMPLE");
  const reportContent = studentReport?.content as
    | {
        pointsForts?: string[];
        axesAmelioration?: string[];
      }
    | null
    | undefined;

  // 3. Construction de l'input IA
  const input: RecommendationInput = {
    filiere: user.profile.filiere,
    diplomaType: user.profile.diplomaType,
    studyLevel: user.profile.studyLevel,
    frenchLevel: user.profile.frenchLevel,
    englishLevel: user.profile.englishLevel,
    interests: user.profile.interests,
    improvements: user.profile.improvements ?? [],
    skills: user.profile.skills.map((s) => ({ name: s.skill.name, level: s.level })),
    testInsights: latestTest
      ? {
          totalScore: latestTest.totalScore,
          technicalScore: latestTest.technicalScore,
          frenchScore: latestTest.frenchScore,
          englishScore: latestTest.englishScore,
          softScore: latestTest.softScore,
          axesAmelioration: reportContent?.axesAmelioration ?? [],
          pointsForts: reportContent?.pointsForts ?? [],
        }
      : undefined,
  };

  // 4. Appel IA
  try {
    const recommendations = await generateRecommendations(input);
    if (recommendations.length === 0) {
      return NextResponse.json(
        { error: "L'IA n'a renvoyé aucune formation — réessaie." },
        { status: 502 }
      );
    }
    return NextResponse.json({
      recommendations,
      hasTestResults: Boolean(latestTest),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Formation recommendation failed:", err);
    return NextResponse.json(
      { error: "Génération IA temporairement indisponible — réessaie." },
      { status: 503 }
    );
  }
}
