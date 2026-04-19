import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { generateTest } from "@/lib/ai/test-generator";

const schema = z.object({ code: z.string().min(4).max(12) });

/**
 * Valide le code admin + génère le test IA personnalisé.
 * Cahier des charges §4.2 & §4.3.
 */
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { code } = schema.parse(await req.json());

  // 1. Vérifier le code
  const testCode = await prisma.testCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!testCode) return NextResponse.json({ error: "Code invalide" }, { status: 400 });
  if (testCode.status !== "ACTIVE") return NextResponse.json({ error: "Code non actif" }, { status: 400 });
  if (testCode.expiresAt < new Date()) return NextResponse.json({ error: "Code expiré" }, { status: 400 });
  if (testCode.usedCount >= testCode.maxUsage) {
    return NextResponse.json({ error: "Code épuisé" }, { status: 400 });
  }

  // 2. Vérifier les pré-requis
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: { include: { skills: { include: { skill: true } } } },
      bookings: { include: { payment: true } },
    },
  });
  if (!user?.profile) return NextResponse.json({ error: "Profil incomplet" }, { status: 400 });
  const hasPaid = user.bookings.some((b) => b.payment?.status === "PAID");
  if (!hasPaid && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Paiement non validé" }, { status: 400 });
  }

  // 3. Vérifier qu'il n'y a pas déjà un test en cours
  const existing = await prisma.testSession.findFirst({
    where: { userId: session.user.id, status: { in: ["GENERATED", "IN_PROGRESS"] } },
  });
  if (existing) {
    return NextResponse.json({ sessionId: existing.id, resumed: true });
  }

  // 4. Génération IA
  try {
    const { questions, usage } = await generateTest({
      firstName: user.firstName,
      filiere: user.profile.filiere,
      diplomaType: user.profile.diplomaType,
      studyLevel: user.profile.studyLevel,
      frenchLevel: user.profile.frenchLevel,
      englishLevel: user.profile.englishLevel,
      interests: user.profile.interests,
      skills: user.profile.skills.map((s) => ({ name: s.skill.name, level: s.level })),
      strengths: user.profile.strengths,
      improvements: user.profile.improvements,
    });

    const testSession = await prisma.testSession.create({
      data: {
        userId: session.user.id,
        codeId: testCode.id,
        status: "GENERATED",
        promptTokens: usage.input,
        completionTokens: usage.output,
        questions: {
          create: questions.map((q, idx) => ({
            section: q.section,
            type: q.type,
            prompt: q.prompt,
            options: q.options ?? undefined,
            correctAnswer: q.correctAnswer,
            correctData: q.correctData ?? undefined,
            domainSkill: q.domainSkill,
            points: q.points ?? 1,
            order: idx,
          })),
        },
      },
    });

    await prisma.testCode.update({
      where: { id: testCode.id },
      data: {
        usedCount: { increment: 1 },
        status: testCode.usedCount + 1 >= testCode.maxUsage ? "USED_UP" : "ACTIVE",
      },
    });

    return NextResponse.json({ sessionId: testSession.id, resumed: false });
  } catch (err) {
    console.error("AI generation failed:", err);
    return NextResponse.json(
      { error: "Génération IA temporairement indisponible — réessayez." },
      { status: 503 }
    );
  }
}
