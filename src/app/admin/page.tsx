import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, KeySquare, Brain, GraduationCap, BarChart3, FileText } from "lucide-react";

export default async function AdminHomePage() {
  const [
    preinscritsCount,
    inscritsCount,
    activeCodes,
    totalTests,
    evaluatedTests,
    activePFE,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", profile: { completionPct: { lt: 100 } } } }),
    prisma.user.count({ where: { role: "STUDENT", profile: { completionPct: 100 } } }),
    prisma.testCode.count({ where: { status: "ACTIVE" } }),
    prisma.testSession.count(),
    prisma.testSession.count({ where: { status: "EVALUATED" } }),
    prisma.pFE.count({ where: { status: { in: ["APPROVED", "IN_PROGRESS"] } } }),
  ]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Back-office WATC</h1>
      <p className="mt-1 text-muted-foreground">
        Pilotage de la plateforme : inscriptions, codes test, rapports, PFE, analytics.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Kpi icon={Users} title="Pré-inscrits" value={preinscritsCount} href="/admin/users" />
        <Kpi icon={Users} title="Inscrits" value={inscritsCount} href="/admin/users" color="success" />
        <Kpi icon={KeySquare} title="Codes actifs" value={activeCodes} href="/admin/codes" />
        <Kpi icon={Brain} title="Tests" value={totalTests} href="/admin/reports" />
        <Kpi icon={FileText} title="Rapports générés" value={evaluatedTests} href="/admin/reports" color="success" />
        <Kpi icon={GraduationCap} title="PFE en cours" value={activePFE} href="/admin/pfe" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Les opérations les plus courantes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary"><Link href="/admin/codes">Générer un code test</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/users">Valider une inscription</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/reports">Voir les rapports IA</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/analytics"><BarChart3 className="h-4 w-4" />Analytics</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  icon: Icon,
  title,
  value,
  href,
  color = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  href: string;
  color?: "primary" | "success";
}) {
  return (
    <Link href={href}>
      <Card className="transition hover:shadow-md">
        <CardHeader className="pb-2">
          <div className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${color === "success" ? "bg-green-100 text-watc-success" : "bg-blue-100 text-watc-primary"}`}>
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
