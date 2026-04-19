import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { ProfileStepper } from "@/components/profile/profile-stepper";

export default async function OnboardingPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { skills: { include: { skill: true } }, experiences: true },
  });

  if (!profile) {
    await prisma.studentProfile.create({ data: { userId: session.user.id } });
  }

  const domains = await prisma.skillDomain.findMany({
    orderBy: { order: "asc" },
    include: { skills: true },
  });

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Complétez votre profil</h1>
        <p className="mt-1 text-muted-foreground">
          4 étapes · vos données sont sauvegardées automatiquement toutes les 30 secondes.
        </p>
      </div>
      <ProfileStepper
        initialProfile={profile ?? undefined}
        domains={domains}
      />
    </div>
  );
}
