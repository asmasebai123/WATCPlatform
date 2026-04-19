"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { OAuthButtons } from "@/components/oauth-buttons";

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      username: form.get("username"),
      email: form.get("email"),
      password: form.get("password"),
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
    };
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Inscription impossible");
      // Auto-login
      await signIn("credentials", {
        email: body.email,
        password: body.password,
        redirect: false,
      });
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      toast({
        variant: "error",
        title: "Inscription échouée",
        message: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" name="firstName" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" name="lastName" required className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="username">Nom d&apos;utilisateur</Label>
          <Input id="username" name="username" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Adresse email</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" minLength={8} required className="mt-1.5" />
          <p className="mt-1 text-xs text-muted-foreground">Minimum 8 caractères.</p>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer mon compte"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">ou avec</span>
        </div>
      </div>

      <OAuthButtons />
    </div>
  );
}
