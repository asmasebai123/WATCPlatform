"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-border/50 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg watc-gradient text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg tracking-tight text-watc-primary">WATC</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#about" className="hover:text-watc-secondary">À propos</a>
          <a href="#process" className="hover:text-watc-secondary">Processus</a>
          <a href="#modules" className="hover:text-watc-secondary">Modules</a>
          <a href="#stack" className="hover:text-watc-secondary">Technologie</a>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild>
            <Link href="/register">S'inscrire</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
