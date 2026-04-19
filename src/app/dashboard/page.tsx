import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowRight,
  Bell,
  CreditCard,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: { include: { skills: true, experiences: true } },
      bookings: { orderBy: { date: "desc" }, take: 1, include: { payment: true } },
      testSessions: { orderBy: { generatedAt: "desc" }, take: 1 },
      pfeProjects: { take: 1 },
      notifications: { where: { readAt: null }, take: 5, orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) redirect("/login");

  const profile = user.profile;
  const completion = profile?.completionPct ?? 0;
  const isPaid = user.bookings.some((b) => b.payment?.status === "PAID");
  const hasBooking = user.bookings.some((b) => b.status === "CONFIRMED" || b.status === "PENDING");
  const canStartTest = completion >= 100 && isPaid && hasBooking;
  const testSession = user.testSessions[0];
  const pfe = user.pfeProjects[0];

  return (
    <div className="container py-8">
      {/* En-tête de bienvenue */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bonjour {user.firstName ?? user.username} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenue sur votre espace WATC — We Are Technology Center.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="ai">
            <Sparkles className="mr-1 h-3 w-3" /> Parcours IA activé
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Carte Profil */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {completion >= 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-watc-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-watc-warning" />
                  )}
                  Statut de votre profil
                </CardTitle>
                <CardDescription>
                  {completion >= 100
                    ? "Votre profil est complet. "
                    : "Complétez les 4 étapes pour débloquer le test. "}
                  {isPaid ? "Paiement validé." : "Paiement en attente."}
                </CardDescription>
              </div>
              <span className="text-3xl font-bold text-watc-primary">{completion}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completion} className="mb-4" />
            <div className="grid gap-3 sm:grid-cols-3">
              <StepStatus label="Coordonnées" done={!!profile?.phone && !!profile?.diplomaType} />
              <StepStatus label="Compétences" done={(profile?.skills?.length ?? 0) > 0} />
              <StepStatus label="Expérience" done={!!profile?.githubUrl || !!profile?.cvUrl || (profile?.experiences?.length ?? 0) > 0} />
              <StepStatus label="Soft skills" done={!!profile?.frenchLevel && !!profile?.englishLevel} />
              <StepStatus label="Date réservée" done={hasBooking} />
              <StepStatus label="Paiement validé" done={isPaid} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {completion < 100 && (
                <Button asChild>
                  <Link href="/onboarding">
                    Terminer mon profil <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {completion >= 100 && !hasBooking && (
                <Button asChild variant="secondary">
                  <Link href="/onboarding/payment">
                    <CreditCard className="h-4 w-4" /> Réserver ma date
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bouton Test (visible seulement si éligible) */}
        <Card className={canStartTest ? "border-watc-accent bg-blue-50" : "opacity-70"}>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md watc-gradient text-white">
              <Brain className="h-5 w-5" />
            </div>
            <CardTitle>Démarrer mon test</CardTitle>
            <CardDescription>
              {canStartTest
                ? "Vous êtes prêt ! Rendez-vous dans les locaux de WATC avec votre code."
                : "Complétez profil, paiement et réservation pour débloquer le test."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testSession ? (
              <Button asChild variant="secondary" className="w-full">
                <Link href="/test/results">Voir mon rapport</Link>
              </Button>
            ) : (
              <Button disabled={!canStartTest} asChild={canStartTest} className="w-full">
                {canStartTest ? <Link href="/test">Démarrer le test</Link> : <span>Verrouillé</span>}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* PFE */}
        <Card>
          <CardHeader>
            <GraduationCap className="mb-2 h-8 w-8 text-watc-secondary" />
            <CardTitle className="text-lg">Suivi PFE</CardTitle>
            <CardDescription>
              {pfe
                ? `${pfe.title} · ${pfe.progress}% d'avancement`
                : "Votre PFE sera disponible après le test."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/pfe">Accéder</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Briefcase className="mb-2 h-8 w-8 text-watc-secondary" />
            <CardTitle className="text-lg">Offres d&apos;emploi</CardTitle>
            <CardDescription>
              Matching IA entreprises partenaires WATC.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/careers">Voir les offres</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Bell className="mb-2 h-8 w-8 text-watc-accent" />
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>
              {user.notifications.length > 0
                ? `${user.notifications.length} non lue(s)`
                : "Tout est à jour."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {user.notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded border bg-muted/30 p-2 text-xs">
                <div className="font-medium">{n.title}</div>
                <div className="text-muted-foreground">{n.body}</div>
              </div>
            ))}
            {user.notifications.length === 0 && (
              <div className="text-xs text-muted-foreground">Aucune notification récente.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Présentation WATC */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>À propos de WATC</CardTitle>
          <CardDescription>We Are Technology Center — votre partenaire de formation et d&apos;insertion.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <div className="mb-1 font-semibold">Formations spécialisées</div>
            <p className="text-muted-foreground">
              Bootcamps et parcours sur mesure : IA, web, mobile, cybersécurité, cloud, embarqué.
            </p>
          </div>
          <div>
            <div className="mb-1 font-semibold">Stages & PFE encadrés</div>
            <p className="text-muted-foreground">
              Un mentor dédié, un suivi Kanban continu, et des livrables évalués à chaque étape.
            </p>
          </div>
          <div>
            <div className="mb-1 font-semibold">Insertion professionnelle</div>
            <p className="text-muted-foreground">
              Certification avec QR code d&apos;authenticité et matching IA avec nos entreprises partenaires.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepStatus({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-watc-success" />
      ) : (
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={done ? "font-medium" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
