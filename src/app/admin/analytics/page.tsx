import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, GraduationCap, Briefcase } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const [usersByFiliere, avgScore, insertionRate, totalInscrits] = await Promise.all([
    prisma.studentProfile.groupBy({
      by: ["filiere"],
      _count: true,
      where: { filiere: { not: null } },
    }),
    prisma.testSession.aggregate({
      _avg: { totalScore: true },
      where: { status: "EVALUATED" },
    }),
    prisma.application.count({ where: { status: "HIRED" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
  ]);

  const rate = totalInscrits === 0 ? 0 : Math.round((insertionRate / totalInscrits) * 100);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Analytics WATC</h1>
      <p className="mt-1 text-muted-foreground">Indicateurs clés de performance de la plateforme.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Metric icon={Users} label="Étudiants inscrits" value={totalInscrits.toString()} />
        <Metric icon={TrendingUp} label="Score moyen" value={`${Math.round(avgScore._avg.totalScore ?? 0)}/100`} />
        <Metric icon={GraduationCap} label="Taux insertion" value={`${rate}%`} />
        <Metric icon={Briefcase} label="Filière majoritaire" value={usersByFiliere[0]?.filiere ?? "—"} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par filière</CardTitle>
            <CardDescription>Basée sur les profils étudiants complétés.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {usersByFiliere.map((f) => (
                <li key={f.filiere ?? "x"} className="flex items-center justify-between">
                  <span className="font-medium">{f.filiere}</span>
                  <span className="text-lg font-bold text-watc-primary">{f._count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prochaines améliorations</CardTitle>
            <CardDescription>
              Graphiques temps réel · Comparaison cohortes · Export PDF/Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Distribution des scores (histogramme)</li>
              <li>Évolution mensuelle des inscriptions</li>
              <li>Heatmap des créneaux de test</li>
              <li>Ratio placement par entreprise</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-watc-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
