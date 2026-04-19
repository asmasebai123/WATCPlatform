"use client";

import type { ProfileDraft } from "./profile-stepper";
import { Trash2, Plus, Github, Linkedin, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function StepExperience({
  draft,
  onChange,
}: {
  draft: ProfileDraft;
  onChange: (v: Partial<ProfileDraft>) => void;
}) {
  const exps = draft.experiences ?? [];

  function addExperience() {
    onChange({ experiences: [...exps, { title: "", description: "" }] });
  }
  function updateExperience(i: number, patch: Partial<(typeof exps)[number]>) {
    const next = [...exps];
    next[i] = { ...next[i], ...patch };
    onChange({ experiences: next });
  }
  function removeExperience(i: number) {
    onChange({ experiences: exps.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Cette étape est optionnelle — ajoutez ce qui vous met en valeur.</p>

      <div>
        <Label htmlFor="githubUrl"><Github className="mr-1 inline h-3.5 w-3.5" /> Lien GitHub</Label>
        <Input id="githubUrl" placeholder="https://github.com/votrenom" value={draft.githubUrl ?? ""} onChange={(e) => onChange({ githubUrl: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="linkedinUrl"><Linkedin className="mr-1 inline h-3.5 w-3.5" /> Lien LinkedIn</Label>
        <Input id="linkedinUrl" placeholder="https://linkedin.com/in/votrenom" value={draft.linkedinUrl ?? ""} onChange={(e) => onChange({ linkedinUrl: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="cv"><FileText className="mr-1 inline h-3.5 w-3.5" /> CV (PDF · max 5 Mo)</Label>
        <Input id="cv" type="file" accept="application/pdf" className="mt-1.5" />
        <p className="mt-1 text-xs text-muted-foreground">Upload géré via Firebase Storage lors de la sauvegarde.</p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label>Expériences / Stages</Label>
          <Button type="button" size="sm" variant="outline" onClick={addExperience}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <div className="space-y-4">
          {exps.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
              Aucune expérience pour le moment.
            </p>
          )}
          {exps.map((exp, i) => (
            <div key={i} className="space-y-3 rounded-md border bg-white p-4">
              <div className="flex gap-2">
                <Input placeholder="Titre du stage / poste" value={exp.title} onChange={(e) => updateExperience(i, { title: e.target.value })} />
                <Input placeholder="Entreprise (optionnel)" value={exp.company ?? ""} onChange={(e) => updateExperience(i, { company: e.target.value })} />
                <Button type="button" variant="destructive" size="icon" onClick={() => removeExperience(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Description de la mission…"
                value={exp.description}
                onChange={(e) => updateExperience(i, { description: e.target.value })}
                rows={3}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
