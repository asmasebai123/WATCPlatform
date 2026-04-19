"use client";

import { useState } from "react";
import type { ProfileDraft } from "./profile-stepper";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function StepSkills({
  draft,
  onChange,
  domains,
}: {
  draft: ProfileDraft;
  onChange: (v: Partial<ProfileDraft>) => void;
  domains: { id: string; name: string; icon: string | null; skills: { id: string; name: string }[] }[];
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function toggleSkill(skillId: string) {
    const skills = draft.skills ?? [];
    const has = skills.find((s) => s.skillId === skillId);
    onChange({
      skills: has
        ? skills.filter((s) => s.skillId !== skillId)
        : [...skills, { skillId, level: "NOTIONS" }],
    });
  }

  function setSkillLevel(skillId: string, level: "NOTIONS" | "PARTIAL" | "COMPLETE") {
    onChange({
      skills: (draft.skills ?? []).map((s) => (s.skillId === skillId ? { ...s, level } : s)),
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Cliquez sur un domaine pour dérouler les technologies associées. Cochez celles que vous maîtrisez et précisez votre niveau.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {domains.map((d) => {
          const isOpen = open[d.id];
          const selectedCount = (draft.skills ?? []).filter((s) =>
            d.skills.some((dk) => dk.id === s.skillId)
          ).length;
          return (
            <div key={d.id} className="rounded-lg border bg-white">
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [d.id]: !o[d.id] }))}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedCount > 0 ? `${selectedCount} technologie(s) sélectionnée(s)` : "Cliquer pour ouvrir"}
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 transition", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="space-y-2 border-t p-4">
                  {d.skills.map((s) => {
                    const found = (draft.skills ?? []).find((x) => x.skillId === s.id);
                    return (
                      <div key={s.id} className="flex items-center justify-between gap-2">
                        <Checkbox
                          id={`skill-${s.id}`}
                          label={s.name}
                          checked={!!found}
                          onCheckedChange={() => toggleSkill(s.id)}
                        />
                        {found && (
                          <Select
                            value={found.level}
                            onChange={(e) => setSkillLevel(s.id, e.target.value as "NOTIONS" | "PARTIAL" | "COMPLETE")}
                            className="h-8 w-44 text-xs"
                          >
                            <option value="NOTIONS">Notions</option>
                            <option value="PARTIAL">Maîtrise partielle</option>
                            <option value="COMPLETE">Maîtrise complète</option>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <Label htmlFor="interests">Centres d&apos;intérêt</Label>
        <Textarea
          id="interests"
          placeholder="Ex : Computer Vision, Blockchain, IoT, Quantum computing…"
          value={draft.interests ?? ""}
          onChange={(e) => onChange({ interests: e.target.value })}
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">Ce que vous voulez apprendre, les sujets qui vous passionnent.</p>
      </div>
    </div>
  );
}
