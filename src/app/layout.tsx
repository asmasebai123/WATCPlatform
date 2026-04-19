import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "WATC — Plateforme PFE Intelligente",
  description:
    "WATC — We Are Technology Center. Plateforme IA d'évaluation, de suivi PFE et d'insertion professionnelle.",
  keywords: ["WATC", "PFE", "IA", "Claude Haiku", "évaluation", "insertion"],
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
