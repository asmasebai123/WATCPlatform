import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, Target, TrendingUp, Brain } from "lucide-react";
import { FormationsClient } from "@/components/formations/formations-client";

export default async function FormationsPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user?.profile) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <BookOpen className="mb-2 h-8 w-8 text-watc-secondary" />
            <CardTitle>Complète d&apos;abord ton profil</CardTitle>
            <CardDescription>
              Pour que l&apos;IA adapte les formations à tes besoins, on a besoin
              de connaître ta filière, tes compétences et tes intérêts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/onboarding">Aller au profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // On vérifie s'il a passé le test IA pour afficher un état "mieux avec le test"
  const latestTest = await prisma.testSession.findFirst({
    where: { userId: session.user.id, status: "EVALUATED" },
    orderBy: { evaluatedAt: "desc" },
    include: { reports: true },
  });

  const studentReport = latestTest?.reports.find((r) => r.kind === "STUDENT_SIMPLE");
  const reportContent = studentReport?.content as
    | { axesAmelioration?: string[]; pointsForts?: string[] }
    | null
    | undefined;

  const axes = reportContent?.axesAmelioration ?? [];
  const forts = reportContent?.pointsForts ?? [];

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-watc-primary" />
        <div>
          <h1 className="text-3xl font-bold">Formations recommandées</h1>
          <p className="text-muted-foreground">
            Sélection générée par IA en fonction de ton profil
            {latestTest ? " et de ton test d'évaluation" : ""}.
          </p>
        </div>
      </div>

      {/* Contexte IA */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-watc-accent" />
              <CardDescription>Filière ciblée</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.profile.filiere ?? "—"}</div>
            <div className="text-xs text-muted-foreground">
              Niveau {user.profile.studyLevel ?? "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-watc-warning" />
              <CardDescription>Axes à renforcer</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {axes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {latestTest ? "Aucun axe détecté" : "Passe le test IA pour détecter tes lacunes"}
              </p>
            ) : (
              <ul className="space-y-1 text-xs">
                {axes.slice(0, 3).map((a, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-watc-warning">→</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-watc-success" />
              <CardDescription>Points forts</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {forts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {latestTest ? "Aucun point fort détecté" : "À détecter via le test IA"}
              </p>
            ) : (
              <ul className="space-y-1 text-xs">
                {forts.slice(0, 3).map((p, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-watc-success">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {!latestTest && (
        <Card className="mb-6 border-watc-accent bg-blue-50">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-start gap-3">
              <Brain className="mt-0.5 h-5 w-5 text-watc-accent" />
              <div>
                <div className="font-medium">
                  Pour des recommandations encore plus ciblées
                </div>
                <p className="text-sm text-muted-foreground">
                  Passe le test IA — nos suggestions seront adaptées à tes lacunes réelles
                  plutôt qu&apos;à ton seul profil déclaratif.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/test">Passer le test</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Centres d'intérêt (pour transparence) */}
      {user.profile.interests && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tes centres d&apos;intérêt pris en compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {user.profile.interests
                .split(/[,\n]/)
                .map((t) => t.trim())
                .filter(Boolean)
                .slice(0, 12)
                .map((tag, i) => (
                  <Badge key={i} variant="outline" className="font-normal">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <FormationsClient />
    </div>
  );
}
