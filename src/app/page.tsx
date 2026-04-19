import Link from "next/link";
import {
  Brain,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Code2,
  Users,
  Rocket,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden watc-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="ai" className="mb-6 bg-white/20 backdrop-blur">
              <Sparkles className="mr-1 h-3 w-3" /> Propulsé par Claude Haiku
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              De l&apos;inscription à l&apos;insertion —<br />
              <span className="text-white/90">accompagnés par l&apos;IA.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 md:text-xl">
              WATC — We Are Technology Center. Une plateforme unique pour évaluer objectivement chaque
              étudiant, personnaliser son parcours PFE, et le connecter aux entreprises partenaires.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" className="min-w-[200px]" asChild>
                <Link href="/register">
                  Commencer gratuitement <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px] border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="#process">Comment ça marche</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: "Tests IA générés", value: "Uniques" },
              { label: "Filières", value: "Info · Elec" },
              { label: "Entreprises", value: "Partenaires" },
              { label: "Suivi PFE", value: "Kanban temps réel" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-white/10 p-4 text-center backdrop-blur">
                <div className="text-xl font-bold md:text-2xl">{s.value}</div>
                <div className="mt-1 text-xs text-white/70 md:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Qui sommes-nous ?</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">
              WATC, centre d&apos;excellence technologique
            </h2>
            <p className="mt-4 text-muted-foreground">
              We Are Technology Center délivre des formations spécialisées et offre des stages au sein
              de sa société partenaire <strong>We Are Technology Company</strong>. Nous accompagnons
              les étudiants de leur évaluation initiale à leur insertion professionnelle concrète.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard icon={Brain} title="Évaluation objective" description="Test IA unique et personnalisé, généré selon votre profil — jamais deux tests identiques." />
            <FeatureCard icon={GraduationCap} title="Parcours sur mesure" description="Formation ciblée, mentorat, suivi continu : chaque étudiant a sa trajectoire." />
            <FeatureCard icon={Briefcase} title="Insertion garantie" description="Certification, badge numérique et matching IA avec nos entreprises partenaires." />
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="watc-gradient-subtle py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Votre parcours</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">8 étapes, de l&apos;inscription à l&apos;emploi</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => (
              <Card key={step.title} className="relative overflow-hidden">
                <div className="absolute -right-2 -top-2 text-6xl font-bold text-watc-primary/5">
                  {i + 1}
                </div>
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg watc-gradient text-white">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">La plateforme</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">5 modules intégrés</h2>
            <p className="mt-4 text-muted-foreground">Une expérience fluide pour étudiants, encadrants, administration et entreprises.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {MODULES.map((m) => (
              <Card key={m.id} className="transition hover:shadow-lg">
                <CardHeader>
                  <Badge variant="ai" className="mb-2 w-fit">{m.id}</Badge>
                  <CardTitle className="text-base">{m.title}</CardTitle>
                  <CardDescription className="text-xs">{m.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* STACK */}
      <section id="stack" className="bg-slate-50 py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Technologie</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Stack moderne et scalable</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {TECH_STACK.map((t) => (
              <div key={t.name} className="flex items-start gap-3 rounded-lg border bg-white p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-watc-success" />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="watc-gradient py-20 text-white">
        <div className="container text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold md:text-4xl">
            Prêt à démarrer votre parcours WATC ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Créez votre compte, passez le test IA, et laissez-nous vous accompagner jusqu&apos;à l&apos;emploi.
          </p>
          <Button size="lg" variant="secondary" className="mt-8 min-w-[220px]" asChild>
            <Link href="/register">Créer mon compte <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-slate-50 py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded watc-gradient text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>© 2025 WATC — We Are Technology Center</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-watc-primary">Connexion</Link>
            <Link href="/register" className="hover:text-watc-primary">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg watc-gradient text-white">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

const PROCESS_STEPS = [
  { icon: Users, title: "1 · Compte", description: "Inscription email ou via Google, GitHub, LinkedIn, Facebook." },
  { icon: CheckCircle2, title: "2 · Profil", description: "4 étapes guidées avec sauvegarde automatique." },
  { icon: ShieldCheck, title: "3 · Réservation", description: "Choisissez votre créneau et payez en ligne (Stripe/D17)." },
  { icon: Brain, title: "4 · Test IA", description: "Questions techniques et non-techniques générées sur mesure." },
  { icon: BarChart3, title: "5 · Rapport", description: "Résultat détaillé : niveau, points forts, axes de progression." },
  { icon: Code2, title: "6 · Parcours", description: "Formations et mentorat adaptés à votre niveau." },
  { icon: GraduationCap, title: "7 · PFE", description: "Kanban de suivi, livrables, encadrant dédié, soutenance." },
  { icon: Rocket, title: "8 · Emploi", description: "Badge certifié + matching IA avec entreprises partenaires." },
];

const MODULES = [
  { id: "M1", title: "Authentification & Profil", description: "Login social, profil 4 étapes, paiement, réservation." },
  { id: "M2", title: "Test IA Personnalisé", description: "Code admin → test technique + non-technique → rapport IA." },
  { id: "M3", title: "Parcours & PFE", description: "Formations, mentorat, Kanban, livrables, soutenance." },
  { id: "M4", title: "Insertion Professionnelle", description: "Certification, matching IA, portail entreprises." },
  { id: "M5", title: "Back-office Admin", description: "Inscriptions, codes, rapports, analytics, encadrants." },
];

const TECH_STACK = [
  { name: "Next.js 14", role: "SSR + App Router" },
  { name: "TypeScript", role: "Type-safety" },
  { name: "Tailwind CSS", role: "UI moderne" },
  { name: "PostgreSQL", role: "Base relationnelle" },
  { name: "Prisma", role: "ORM" },
  { name: "Claude Haiku", role: "IA (tests + rapports)" },
  { name: "NextAuth.js", role: "OAuth multi-providers" },
  { name: "Stripe + D17", role: "Paiements (CB + mobile)" },
];
