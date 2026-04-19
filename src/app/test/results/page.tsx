import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, TrendingUp, Trophy, ArrowRight, Sparkles } from "lucide-react";

export default async function ResultsPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const latest = await prisma.testSession.findFirst({
    where: { userId: session.user.id, status: "EVALUATED" },
    orderBy: { evaluatedAt: "desc" },
    include: { reports: true },
  });

  if (!latest) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Aucun rapport disponible</h1>
        <p className="mt-2 text-muted-foreground">Passez d&apos;abord le test pour voir votre rapport.</p>
        <Button className="mt-4" asChild>
          <Link href="/test">Démarrer le test</Link>
        </Button>
      </div>
    );
  }

  const studentReport = latest.reports.find((r) => r.kind === "STUDENT_SIMPLE")?.content as Record<string, unknown> | null;

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6 flex items-center gap-3">
        <Trophy className="h-8 w-8 text-watc-accent" />
        <div>
          <h1 className="text-3xl font-bold">Votre rapport WATC</h1>
          <p className="text-muted-foreground">Généré par IA · Claude Haiku</p>
        </div>
      </div>

      <Card className="border-watc-accent bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Score global</CardTitle>
              <CardDescription>Niveau détecté : {latest.level ?? "—"}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-watc-primary">{latest.totalScore ?? 0}<span className="text-xl text-muted-foreground">/100</span></div>
              <Badge variant="ai" className="mt-2">
                <Sparkles className="mr-1 h-3 w-3" /> {latest.level ?? "—"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SectionScore label="Technique" value={latest.technicalScore ?? 0} />
          <SectionScore label="Français" value={latest.frenchScore ?? 0} />
          <SectionScore label="Anglais" value={latest.englishScore ?? 0} />
          <SectionScore label="Soft Skills" value={latest.softScore ?? 0} />
        </CardContent>
      </Card>

      {studentReport && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-watc-success" /> Vos 3 points forts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(studentReport.pointsForts as string[] | undefined)?.map((p, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="mt-0.5 text-watc-success">•</span> {p}</li>
                )) ?? <li className="text-muted-foreground">—</li>}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-watc-warning" /> Axes d&apos;amélioration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(studentReport.axesAmelioration as string[] | undefined)?.map((a, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="mt-0.5 text-watc-warning">→</span> {a}</li>
                )) ?? <li className="text-muted-foreground">—</li>}
              </ul>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Parcours suggéré</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {(studentReport.parcoursSuggere as string[] | undefined)?.map((p, i) => (
                  <li key={i} className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{p}</li>
                )) ?? <li className="text-muted-foreground">—</li>}
              </ul>
            </CardContent>
          </Card>
          {typeof studentReport.messageMotivation === "string" && (
            <Card className="md:col-span-2 border-watc-accent bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">💬 Message de votre coach IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{studentReport.messageMotivation}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/pfe">Voir mon parcours PFE <ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/dashboard">Retour au dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

function SectionScore({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{value}/100</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
