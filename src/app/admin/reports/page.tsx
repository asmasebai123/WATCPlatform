import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function AdminReportsPage() {
  const sessions = await prisma.testSession.findMany({
    orderBy: { submittedAt: "desc" },
    include: { user: { include: { profile: true } }, reports: true },
    take: 100,
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Rapports IA</h1>
      <p className="mt-1 text-muted-foreground">Tous les rapports générés par Claude Haiku.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sessions de test ({sessions.length})</CardTitle>
          <CardDescription>Filtrer : date, niveau, filière, score</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="pb-2">Étudiant</th>
                <th className="pb-2">Filière</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Niveau</th>
                <th className="pb-2">Statut</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">Aucun rapport.</td></tr>
              )}
              {sessions.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">
                    {s.user.firstName} {s.user.lastName}
                  </td>
                  <td className="py-3 text-muted-foreground">{s.user.profile?.filiere ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{formatDate(s.submittedAt)}</td>
                  <td className="py-3 font-semibold">{s.totalScore ?? "—"}/100</td>
                  <td className="py-3">{s.level ? <Badge variant="ai">{s.level}</Badge> : "—"}</td>
                  <td className="py-3">
                    <Badge variant={s.status === "EVALUATED" ? "success" : "warning"}>{s.status}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button size="sm" variant="outline">Voir rapport</Button>
                    <Button size="sm" variant="ghost" className="ml-1">PDF</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
