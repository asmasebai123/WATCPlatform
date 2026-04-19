import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: Date | string | null | undefined, locale = "fr-FR") {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatCurrency(amount: number, currency = "TND") {
  return new Intl.NumberFormat("fr-TN", { style: "currency", currency }).format(amount / 1000);
}

export function generateTestCode(length = 8) {
  // Alphanumérique, majuscules + chiffres (hors 0/O/1/I pour éviter la confusion)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function computeProfileCompletion(profile: {
  phone?: string | null;
  dateOfBirth?: Date | null;
  diplomaType?: string | null;
  filiere?: string | null;
  studyLevel?: string | null;
  frenchLevel?: string | null;
  englishLevel?: string | null;
  strengths?: string[];
  skills?: unknown[];
}) {
  const checks = [
    !!profile.phone,
    !!profile.dateOfBirth,
    !!profile.diplomaType,
    !!profile.filiere,
    !!profile.studyLevel,
    (profile.skills?.length ?? 0) > 0,
    !!profile.frenchLevel,
    !!profile.englishLevel,
    (profile.strengths?.length ?? 0) > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
