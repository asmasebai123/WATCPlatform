"use client";

import type { ProfileDraft } from "./profile-stepper";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const SOFT_SKILLS = [
  "Leadership",
  "Communication",
  "Travail en équipe",
  "Gestion du temps",
  "Créativité",
  "Esprit analytique",
  "Résolution de problèmes",
  "Curiosité intellectuelle",
  "Adaptabilité",
  "Sens des responsabilités",
];

const LANG_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "NATIVE"] as const;

export function StepSoftSkills({
  draft,
  onChange,
}: {
  draft: ProfileDraft;
  onChange: (v: Partial<ProfileDraft>) => void;
}) {
  const strengths = draft.strengths ?? [];
  const improvements = draft.improvements ?? [];

  function toggle(list: "strengths" | "improvements", s: string) {
    const current = draft[list] ?? [];
    const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s];
    onChange({ [list]: next });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="frenchLevel">Niveau en français</Label>
          <Select id="frenchLevel" value={draft.frenchLevel ?? ""} onChange={(e) => onChange({ frenchLevel: e.target.value })} className="mt-1.5">
            <option value="">Sélectionner…</option>
            {LANG_LEVELS.map((l) => <option key={l} value={l}>{l === "NATIVE" ? "Langue maternelle" : l}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="englishLevel">Niveau en anglais</Label>
          <Select id="englishLevel" value={draft.englishLevel ?? ""} onChange={(e) => onChange({ englishLevel: e.target.value })} className="mt-1.5">
            <option value="">Sélectionner…</option>
            {LANG_LEVELS.map((l) => <option key={l} value={l}>{l === "NATIVE" ? "Langue maternelle" : l}</option>)}
          </Select>
        </div>
      </div>

      <div>
        <Label>Points forts</Label>
        <p className="mb-2 text-xs text-muted-foreground">Cochez vos atouts principaux.</p>
        <div className="grid gap-2 md:grid-cols-2">
          {SOFT_SKILLS.map((s) => (
            <Checkbox
              key={`f-${s}`}
              id={`f-${s}`}
              label={s}
              checked={strengths.includes(s)}
              onCheckedChange={() => toggle("strengths", s)}
            />
          ))}
        </div>
      </div>

      <div>
        <Label>Points à améliorer</Label>
        <p className="mb-2 text-xs text-muted-foreground">Les compétences que vous souhaitez développer.</p>
        <div className="grid gap-2 md:grid-cols-2">
          {SOFT_SKILLS.map((s) => (
            <Checkbox
              key={`i-${s}`}
              id={`i-${s}`}
              label={s}
              checked={improvements.includes(s)}
              onCheckedChange={() => toggle("improvements", s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
