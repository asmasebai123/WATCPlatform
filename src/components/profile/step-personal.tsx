"use client";

import type { ProfileDraft } from "./profile-stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function StepPersonal({
  draft,
  onChange,
}: {
  draft: ProfileDraft;
  onChange: (v: Partial<ProfileDraft>) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor="firstName">Prénom</Label>
        <Input id="firstName" value={draft.firstName ?? ""} onChange={(e) => onChange({ firstName: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="lastName">Nom</Label>
        <Input id="lastName" value={draft.lastName ?? ""} onChange={(e) => onChange({ lastName: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="dateOfBirth">Date de naissance</Label>
        <Input id="dateOfBirth" type="date" value={draft.dateOfBirth ?? ""} onChange={(e) => onChange({ dateOfBirth: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="phone">Numéro de téléphone</Label>
        <Input id="phone" type="tel" placeholder="+216 20 123 456" value={draft.phone ?? ""} onChange={(e) => onChange({ phone: e.target.value })} className="mt-1.5" />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="address">Adresse postale</Label>
        <Input id="address" value={draft.address ?? ""} onChange={(e) => onChange({ address: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="diplomaType">Type de diplôme</Label>
        <Select
          id="diplomaType"
          value={draft.diplomaType ?? ""}
          onChange={(e) => onChange({ diplomaType: e.target.value as ProfileDraft["diplomaType"] })}
          className="mt-1.5"
        >
          <option value="">Sélectionner…</option>
          <option value="INGENIEUR">Ingénieur</option>
          <option value="MASTER">Master</option>
          <option value="LICENCE">Licence</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="filiere">Filière</Label>
        <Select
          id="filiere"
          value={draft.filiere ?? ""}
          onChange={(e) => onChange({ filiere: e.target.value as ProfileDraft["filiere"] })}
          className="mt-1.5"
        >
          <option value="">Sélectionner…</option>
          <option value="INFORMATIQUE">Informatique</option>
          <option value="ELECTRONIQUE">Électronique</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="studyLevel">Niveau d&apos;études</Label>
        <Select
          id="studyLevel"
          value={draft.studyLevel ?? ""}
          onChange={(e) => onChange({ studyLevel: e.target.value as ProfileDraft["studyLevel"] })}
          className="mt-1.5"
        >
          <option value="">Sélectionner…</option>
          <option value="PREMIERE_ANNEE">1ère année</option>
          <option value="DEUXIEME_ANNEE">2ème année</option>
          <option value="TERMINALE">Terminale (dernière année)</option>
        </Select>
      </div>
    </div>
  );
}
