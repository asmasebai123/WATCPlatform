"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { StepPersonal } from "@/components/profile/step-personal";
import { StepSkills } from "@/components/profile/step-skills";
import { StepExperience } from "@/components/profile/step-experience";
import { StepSoftSkills } from "@/components/profile/step-soft-skills";

export type ProfileDraft = {
  // Étape 1
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  phone?: string;
  address?: string;
  diplomaType?: "INGENIEUR" | "MASTER" | "LICENCE";
  filiere?: "INFORMATIQUE" | "ELECTRONIQUE";
  studyLevel?: "PREMIERE_ANNEE" | "DEUXIEME_ANNEE" | "TERMINALE";
  profileImageUrl?: string;
  // Étape 2
  skills?: { skillId: string; level: "NOTIONS" | "PARTIAL" | "COMPLETE" }[];
  interests?: string;
  // Étape 3
  githubUrl?: string;
  linkedinUrl?: string;
  cvUrl?: string;
  experiences?: { title: string; description: string; company?: string }[];
  // Étape 4
  frenchLevel?: string;
  englishLevel?: string;
  strengths?: string[];
  improvements?: string[];
};

const STEPS = [
  { key: 1, title: "Coordonnées", description: "Informations personnelles" },
  { key: 2, title: "Compétences", description: "Domaines & technologies" },
  { key: 3, title: "Expérience", description: "GitHub, CV, stages" },
  { key: 4, title: "Soft skills", description: "Langues & points forts" },
] as const;

export function ProfileStepper({
  initialProfile,
  domains,
}: {
  initialProfile?: {
    currentStep: number;
    dateOfBirth?: Date | null;
    phone?: string | null;
    address?: string | null;
    diplomaType?: string | null;
    filiere?: string | null;
    studyLevel?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    cvUrl?: string | null;
    interests?: string | null;
    frenchLevel?: string | null;
    englishLevel?: string | null;
    strengths: string[];
    improvements: string[];
    skills: { skillId: string; level: string }[];
    experiences: { title: string; description: string; company: string | null }[];
  };
  domains: { id: string; name: string; icon: string | null; skills: { id: string; name: string }[] }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<number>(
    Math.min(Math.max(initialProfile?.currentStep ?? 1, 1), 4)
  );
  const [saving, setSaving] = useState(false);
  const [lastSave, setLastSave] = useState<Date | null>(null);
  const [draft, setDraft] = useState<ProfileDraft>({
    phone: initialProfile?.phone ?? "",
    address: initialProfile?.address ?? "",
    dateOfBirth: initialProfile?.dateOfBirth ? new Date(initialProfile.dateOfBirth).toISOString().slice(0, 10) : "",
    diplomaType: (initialProfile?.diplomaType ?? undefined) as ProfileDraft["diplomaType"],
    filiere: (initialProfile?.filiere ?? undefined) as ProfileDraft["filiere"],
    studyLevel: (initialProfile?.studyLevel ?? undefined) as ProfileDraft["studyLevel"],
    githubUrl: initialProfile?.githubUrl ?? "",
    linkedinUrl: initialProfile?.linkedinUrl ?? "",
    cvUrl: initialProfile?.cvUrl ?? "",
    interests: initialProfile?.interests ?? "",
    frenchLevel: initialProfile?.frenchLevel ?? undefined,
    englishLevel: initialProfile?.englishLevel ?? undefined,
    strengths: initialProfile?.strengths ?? [],
    improvements: initialProfile?.improvements ?? [],
    skills: initialProfile?.skills.map((s) => ({
      skillId: s.skillId,
      level: s.level as "NOTIONS" | "PARTIAL" | "COMPLETE",
    })) ?? [],
    experiences: initialProfile?.experiences.map((e) => ({
      title: e.title,
      description: e.description,
      company: e.company ?? undefined,
    })) ?? [],
  });

  // Auto-save toutes les 30 secondes (cahier des charges §9.1)
  const save = useCallback(
    async (stepNumber: number, silent = false) => {
      setSaving(true);
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...draft, currentStep: stepNumber }),
        });
        if (!res.ok) throw new Error("Échec de sauvegarde");
        setLastSave(new Date());
        if (!silent) toast({ variant: "success", message: "Profil sauvegardé." });
      } catch (err) {
        toast({ variant: "error", message: (err as Error).message });
      } finally {
        setSaving(false);
      }
    },
    [draft, toast]
  );

  useEffect(() => {
    const t = setInterval(() => save(step, true), 30_000);
    return () => clearInterval(t);
  }, [save, step]);

  async function handleNext() {
    await save(step + 1, true);
    if (step < 4) setStep(step + 1);
    else {
      toast({ variant: "success", title: "Profil complet !", message: "Réservez maintenant votre date de test." });
      router.push("/onboarding/payment");
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center">
            <button
              onClick={() => setStep(s.key)}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition",
                step === s.key && "border-watc-primary bg-watc-primary text-white",
                step > s.key && "border-watc-success bg-watc-success text-white",
                step < s.key && "border-border bg-white text-muted-foreground"
              )}
            >
              {step > s.key ? <Check className="h-4 w-4" /> : s.key}
            </button>
            <div className="ml-3 hidden flex-col md:flex">
              <div className={cn("text-sm font-medium", step === s.key ? "text-watc-primary" : "")}>
                {s.title}
              </div>
              <div className="text-xs text-muted-foreground">{s.description}</div>
            </div>
            {i < STEPS.length - 1 && <div className={cn("mx-2 h-0.5 flex-1", step > s.key ? "bg-watc-success" : "bg-border")} />}
          </div>
        ))}
      </div>

      {/* Contenu */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Étape {step} · {STEPS[step - 1]?.title ?? ""}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {saving ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Sauvegarde…</>
              ) : lastSave ? (
                <><Save className="h-3 w-3" /> Sauvegardé à {lastSave.toLocaleTimeString("fr-FR")}</>
              ) : (
                <span>Auto-save activé</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && <StepPersonal draft={draft} onChange={(v) => setDraft((d) => ({ ...d, ...v }))} />}
          {step === 2 && <StepSkills draft={draft} onChange={(v) => setDraft((d) => ({ ...d, ...v }))} domains={domains} />}
          {step === 3 && <StepExperience draft={draft} onChange={(v) => setDraft((d) => ({ ...d, ...v }))} />}
          {step === 4 && <StepSoftSkills draft={draft} onChange={(v) => setDraft((d) => ({ ...d, ...v }))} />}

          <div className="mt-8 flex justify-between border-t pt-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>Précédent</Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => save(step)} disabled={saving}>
                <Save className="h-4 w-4" /> Enregistrer
              </Button>
              <Button onClick={handleNext} disabled={saving}>
                {step === 4 ? "Terminer & Réserver" : "Suivant"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
