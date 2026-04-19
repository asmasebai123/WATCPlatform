import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Building2, Clock, Sparkles, Filter, Target } from "lucide-react";
import { JOB_OFFERS, matchScore } from "@/lib/data/jobs";

export default async function CareersPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { skills: { include: { skill: true } } },
  });

  const skillsForMatch = (profile?.skills ?? []).map((s) => ({ name: s.skill.name }));
  const ranked = JOB_OFFERS
    .map((offer) => ({ offer, score: matchScore(offer, { filiere: profile?.filiere, skills: skillsForMatch }) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const avg = Math.round(ranked.reduce((s, r) => s + r.score, 0) / ranked.length);

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-3">
        <Briefcase className="h-8 w-8 text-watc-primary" />
        <div>
          <h1 className="text-3xl font-bold">Offres d&apos;emploi</h1>
          <p className="text-muted-foreground">
            Classées par compatibilité avec votre profil · {JOB_OFFERS.length} offres disponibles
          </p>
        </div>
      </div>

      {/* Résumé */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-watc-accent" />
              <CardDescription>Meilleure compatibilité</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-watc-primary">{top?.score ?? 0}%</div>
            <div className="text-xs text-muted-foreground">{top?.offer.title}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-watc-accent" />
              <CardDescription>Score moyen</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avg}%</div>
            <div className="text-xs text-muted-foreground">Sur toutes les offres</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-watc-accent" />
              <CardDescription>Filière détectée</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.filiere ?? "—"}</div>
            <div className="text-xs text-muted-foreground">
              {(profile?.skills?.length ?? 0)} compétences déclarées
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste d'offres */}
      <div className="space-y-4">
        {ranked.map(({ offer, score }) => (
          <Card key={offer.id} className="transition hover:border-watc-accent">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={offer.type === "CDI" ? "success" : offer.type === "STAGE" ? "ai" : "outline"}>
                      {offer.type}
                    </Badge>
                    {offer.postedDays === 0 && <Badge variant="warning">Nouveau</Badge>}
                    {score >= 75 && <Badge variant="success"><Sparkles className="mr-1 h-3 w-3" />Excellent match</Badge>}
                  </div>
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{offer.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{offer.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />
                      {offer.postedDays === 0 ? "Aujourd'hui" : `Il y a ${offer.postedDays}j`}
                    </span>
                    {offer.salary && <span>· {offer.salary}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${score >= 75 ? "text-watc-success" : score >= 50 ? "text-watc-accent" : "text-muted-foreground"}`}>
                    {score}%
                  </div>
                  <div className="text-xs text-muted-foreground">match</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">{offer.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {offer.requiredSkills.map((s) => (
                  <Badge key={s} variant="outline" className="font-normal">{s}</Badge>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm">Postuler</Button>
                <Button size="sm" variant="outline">Sauvegarder</Button>
                <Button size="sm" variant="ghost">Voir détails</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
