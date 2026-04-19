import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";

export default async function AdminPFEPage() {
  const pfe = await prisma.pFE.findMany({
    include: {
      student: true,
      supervisor: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const supervisors = await prisma.supervisor.findMany({
    include: { user: true, _count: { select: { pfeProjects: true } } },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Gestion des PFE</h1>
      <p className="mt-1 text-muted-foreground">Vue globale · Encadrants · Calendrier des soutenances.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>PFE en cours ({pfe.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pfe.length === 0 && <p className="text-sm text-muted-foreground">Aucun PFE.</p>}
            {pfe.map((p) => (
              <div key={p.id} className="rounded-md border p-3">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.student.firstName} {p.student.lastName} · Encadrant : {p.supervisor?.user?.firstName ?? "à assigner"}
                    </div>
                  </div>
                  <Badge variant="ai">{p.status}</Badge>
                </div>
                <Progress value={p.progress} />
                <div className="mt-1 text-xs text-muted-foreground">
                  {p.progress}% · Fin prévue : {formatDate(p.endDate)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Encadrants</CardTitle>
            <CardDescription>Charge et disponibilité.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {supervisors.length === 0 && <p className="text-sm text-muted-foreground">Aucun encadrant.</p>}
            {supervisors.map((s) => (
              <div key={s.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{s.user.firstName} {s.user.lastName}</div>
                <div className="text-xs text-muted-foreground">
                  {s._count.pfeProjects}/{s.maxStudents} PFE · {s.available ? "Disponible" : "Indisponible"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
