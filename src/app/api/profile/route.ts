import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { computeProfileCompletion } from "@/lib/utils";

const skillInput = z.object({
  skillId: z.string(),
  level: z.enum(["NOTIONS", "PARTIAL", "COMPLETE"]),
});

const experienceInput = z.object({
  title: z.string(),
  description: z.string(),
  company: z.string().optional().nullable(),
});

const patchSchema = z.object({
  currentStep: z.number().int().min(1).max(5).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional().nullable(),
  phone: z.string().optional(),
  address: z.string().optional(),
  diplomaType: z.enum(["INGENIEUR", "MASTER", "LICENCE"]).optional(),
  filiere: z.enum(["INFORMATIQUE", "ELECTRONIQUE"]).optional(),
  studyLevel: z.enum(["PREMIERE_ANNEE", "DEUXIEME_ANNEE", "TERMINALE"]).optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  cvUrl: z.string().optional(),
  interests: z.string().optional(),
  frenchLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "NATIVE"]).optional(),
  englishLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "NATIVE"]).optional(),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  skills: z.array(skillInput).optional(),
  experiences: z.array(experienceInput).optional(),
});

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { skills: { include: { skill: true } }, experiences: true },
  });
  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = patchSchema.parse(await req.json());

  // Mise à jour de User si prénom/nom fournis
  if (body.firstName || body.lastName) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(body.firstName ? { firstName: body.firstName } : {}),
        ...(body.lastName ? { lastName: body.lastName } : {}),
      },
    });
  }

  const profile = await prisma.studentProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      currentStep: body.currentStep ?? 1,
      phone: body.phone,
      address: body.address,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      diplomaType: body.diplomaType,
      filiere: body.filiere,
      studyLevel: body.studyLevel,
      githubUrl: body.githubUrl,
      linkedinUrl: body.linkedinUrl,
      cvUrl: body.cvUrl,
      interests: body.interests,
      frenchLevel: body.frenchLevel,
      englishLevel: body.englishLevel,
      strengths: body.strengths ?? [],
      improvements: body.improvements ?? [],
    },
    update: {
      ...(body.currentStep !== undefined ? { currentStep: body.currentStep } : {}),
      phone: body.phone,
      address: body.address,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      diplomaType: body.diplomaType,
      filiere: body.filiere,
      studyLevel: body.studyLevel,
      githubUrl: body.githubUrl,
      linkedinUrl: body.linkedinUrl,
      cvUrl: body.cvUrl,
      interests: body.interests,
      frenchLevel: body.frenchLevel,
      englishLevel: body.englishLevel,
      ...(body.strengths ? { strengths: body.strengths } : {}),
      ...(body.improvements ? { improvements: body.improvements } : {}),
    },
  });

  // Skills : réconciliation
  if (body.skills) {
    await prisma.profileSkill.deleteMany({ where: { profileId: profile.id } });
    if (body.skills.length > 0) {
      await prisma.profileSkill.createMany({
        data: body.skills.map((s) => ({
          profileId: profile.id,
          skillId: s.skillId,
          level: s.level,
        })),
      });
    }
  }

  // Experiences
  if (body.experiences) {
    await prisma.experience.deleteMany({ where: { profileId: profile.id } });
    if (body.experiences.length > 0) {
      await prisma.experience.createMany({
        data: body.experiences.map((e) => ({
          profileId: profile.id,
          title: e.title,
          description: e.description,
          company: e.company ?? undefined,
        })),
      });
    }
  }

  // Recompute completion percentage
  const fresh = await prisma.studentProfile.findUnique({
    where: { id: profile.id },
    include: { skills: true },
  });

  if (fresh) {
    const pct = computeProfileCompletion(fresh);
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        completionPct: pct,
        status: pct >= 100 ? "COMPLETE" : "INCOMPLETE",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
