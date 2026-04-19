import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KanbanBoard } from "@/components/pfe/kanban-board";
import { GraduationCap, Calendar, User, FileCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function PFEPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  let pfe = await prisma.pFE.findFirst({
    where: { studentId: session.user.id },
    include: {
      supervisor: { include: { user: true } },
      tasks: { orderBy: { order: "asc" } },
      deliverables: { orderBy: { submittedAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // DEMO : auto-validation — si le test est évalué mais qu'aucun PFE n'existe,
  // on en crée un automatiquement (en prod, cela est fait manuellement par l'admin).
  if (!pfe) {
    const evaluatedTest = await prisma.testSession.findFirst({
      where: { userId: session.user.id, status: "EVALUATED" },
      orderBy: { evaluatedAt: "desc" },
    });

    if (evaluatedTest) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true },
      });
      const filiere = user?.profile?.filiere ?? "INFORMATIQUE";
      const title =
        filiere === "INFORMATIQUE"
          ? "Développement d'une application web moderne"
          : "Conception d'un système embarqué IoT";
      const domain = filiere === "INFORMATIQUE" ? "Développement Web" : "Électronique embarquée";
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 4);

      await prisma.pFE.create({
        data: {
          studentId: session.user.id,
          title,
          description:
            "Projet de Fin d'Études auto-généré suite à l'évaluation IA. L'étudiant démarre son parcours PFE avec un backlog de tâches pré-rempli. L'encadrant sera assigné prochainement.",
          domain,
          status: "APPROVED",
          progress: 0,
          startDate: start,
          endDate: end,
          tasks: {
            create: [
              { title: "Étude bibliographique", description: "Recherche des technologies existantes et état de l'art.", status: "BACKLOG", order: 0 },
              { title: "Cahier des charges", description: "Rédiger les spécifications fonctionnelles et techniques.", status: "BACKLOG", order: 1 },
              { title: "Conception architecturale", description: "Diagrammes UML, choix techniques, maquettes.", status: "BACKLOG", order: 2 },
              { title: "Développement MVP", description: "Première version fonctionnelle du projet.", status: "BACKLOG", order: 3 },
              { title: "Tests & validation", description: "Tests unitaires, tests d'intégration, recette utilisateur.", status: "BACKLOG", order: 4 },
              { title: "Rédaction du rapport final", description: "Document final à remettre au jury.", status: "BACKLOG", order: 5 },
              { title: "Préparation soutenance", description: "Slides, démo, répétitions.", status: "BACKLOG", order: 6 },
            ],
          },
        },
      });

      pfe = await prisma.pFE.findFirst({
        where: { studentId: session.user.id },
        include: {
          supervisor: { include: { user: true } },
          tasks: { orderBy: { order: "asc" } },
          deliverables: { orderBy: { submittedAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  if (!pfe) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <GraduationCap className="mb-2 h-8 w-8 text-watc-secondary" />
            <CardTitle>Aucun PFE en cours</CardTitle>
            <CardDescription>
              Passez d&apos;abord votre test d&apos;évaluation — votre PFE sera activé automatiquement ensuite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/test">Passer le test</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="ai" className="mb-2">{pfe.status}</Badge>
                <CardTitle className="text-2xl">{pfe.title}</CardTitle>
                <CardDescription>{pfe.domain}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-watc-primary">{pfe.progress}%</div>
                <div className="text-xs text-muted-foreground">avancement</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">{pfe.description}</p>
            <Progress value={pfe.progress} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow icon={User} label="Encadrant" value={pfe.supervisor?.user?.firstName ? `${pfe.supervisor.user.firstName} ${pfe.supervisor.user.lastName ?? ""}` : "À assigner"} />
            <InfoRow icon={Calendar} label="Début" value={formatDate(pfe.startDate)} />
            <InfoRow icon={Calendar} label="Fin prévue" value={formatDate(pfe.endDate)} />
            <InfoRow icon={FileCheck} label="Livrables" value={`${pfe.deliverables.length} déposé(s)`} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tableau Kanban</CardTitle>
          <CardDescription>Backlog · En cours · En révision · Terminé</CardDescription>
        </CardHeader>
        <CardContent>
          <KanbanBoard pfeId={pfe.id} tasks={pfe.tasks} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Livrables</CardTitle>
          <CardDescription>Rapports intermédiaires, prototypes, rapport final.</CardDescription>
        </CardHeader>
        <CardContent>
          {pfe.deliverables.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun livrable encore soumis.</p>
          )}
          <ul className="space-y-3">
            {pfe.deliverables.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.kind} · v{d.version} · {formatDate(d.submittedAt)}
                  </div>
                </div>
                {d.grade != null && <Badge variant="success">{d.grade}/20</Badge>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label} :</span>
      <span className="ml-auto font-medium">{value}</span>
    </div>
  );
}
