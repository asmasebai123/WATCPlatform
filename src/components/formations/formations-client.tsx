"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  BookOpen,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Award,
  FileText,
} from "lucide-react";
import type { Recommendation } from "@/lib/ai/recommendations";

type ApiResponse = {
  recommendations: Recommendation[];
  hasTestResults: boolean;
  generatedAt: string;
  error?: string;
};

const FORMAT_META: Record<
  Recommendation["format"],
  { label: string; icon: typeof PlayCircle; className: string }
> = {
  VIDEO: { label: "Vidéo", icon: PlayCircle, className: "bg-red-50 text-red-700 border-red-200" },
  COURS: { label: "Cours", icon: BookOpen, className: "bg-blue-50 text-blue-700 border-blue-200" },
  DOC: { label: "Doc", icon: FileText, className: "bg-slate-50 text-slate-700 border-slate-200" },
  BOOTCAMP: {
    label: "Bootcamp",
    icon: GraduationCap,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  CERTIFICATION: {
    label: "Certif.",
    icon: Award,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

const LEVEL_META: Record<Recommendation["level"], { label: string; variant: "outline" | "ai" | "success" }> = {
  DEBUTANT: { label: "Débutant", variant: "success" },
  INTERMEDIAIRE: { label: "Intermédiaire", variant: "ai" },
  AVANCE: { label: "Avancé", variant: "outline" },
};

export function FormationsClient() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/formations", { method: "POST" });
      const data = (await res.json()) as ApiResponse;

      if (!res.ok) {
        throw new Error(data.error ?? "Erreur inconnue");
      }

      setRecommendations(data.recommendations);
      setGeneratedAt(data.generatedAt);
      setHasLoadedOnce(true);
      toast({
        variant: "success",
        title: "Formations générées",
        message: `${data.recommendations.length} formations adaptées à ton profil.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de contacter l'IA.";
      toast({ variant: "error", title: "Oups", message });
      setHasLoadedOnce(true);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Génère automatiquement au premier affichage.
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {generatedAt ? (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-watc-accent" />
              Généré par IA · {new Date(generatedAt).toLocaleString("fr-FR")}
            </span>
          ) : loading ? (
            "L'IA sélectionne les meilleures formations pour toi..."
          ) : (
            "Aucune génération en cours."
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchRecommendations}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Génération...
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" /> Régénérer
            </>
          )}
        </Button>
      </div>

      {loading && recommendations.length === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="mt-2 h-5 w-2/3 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-3 w-full rounded bg-muted" />
                <div className="mt-2 h-3 w-5/6 rounded bg-muted" />
                <div className="mt-4 h-8 w-24 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && hasLoadedOnce && recommendations.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucune formation pour le moment. Réessaie dans quelques secondes.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((reco, idx) => {
          const fmt = FORMAT_META[reco.format] ?? FORMAT_META.COURS;
          const lvl = LEVEL_META[reco.level] ?? LEVEL_META.INTERMEDIAIRE;
          const FormatIcon = fmt.icon;

          return (
            <Card key={idx} className="flex flex-col transition hover:border-watc-accent">
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className={fmt.className + " border"} variant="outline">
                    <FormatIcon className="mr-1 h-3 w-3" /> {fmt.label}
                  </Badge>
                  <Badge variant={lvl.variant}>{lvl.label}</Badge>
                  {reco.free ? (
                    <Badge variant="success">Gratuit</Badge>
                  ) : (
                    <Badge variant="warning">Payant</Badge>
                  )}
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {reco.durationHours}h
                  </span>
                </div>
                <CardTitle className="text-base leading-tight">{reco.title}</CardTitle>
                <CardDescription className="text-xs">{reco.provider}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <div className="mb-3 rounded-md border border-watc-accent/30 bg-blue-50/50 p-2 text-xs">
                  <div className="mb-1 font-semibold text-watc-primary">
                    Pourquoi cette formation ?
                  </div>
                  <p className="text-muted-foreground">{reco.why}</p>
                </div>

                <div className="mb-3 text-xs">
                  <span className="font-medium">Objectif : </span>
                  <span className="text-muted-foreground">{reco.targets}</span>
                </div>

                {reco.tags?.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {reco.tags.slice(0, 6).map((t, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-auto">
                  <Button asChild size="sm" className="w-full">
                    <a
                      href={reco.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ouvrir la formation <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
