"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

/**
 * Écran "code admin" avant démarrage du test — §4.2
 */
export function TestGate() {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/test/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Code invalide");
      toast({
        variant: "success",
        message: data.resumed ? "Reprise de votre test." : "Test généré — c'est parti !",
      });
      router.refresh();
    } catch (err) {
      toast({ variant: "error", title: "Impossible de démarrer", message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center watc-gradient-subtle px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full watc-gradient text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>Démarrer le test IA</CardTitle>
          <CardDescription>
            Saisissez le code d&apos;accès fourni par l&apos;administration WATC.
            <br />Le test doit être passé dans les locaux du centre.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="code">Code d&apos;accès</Label>
            <div className="relative mt-1.5">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="pl-10 text-center text-lg tracking-widest"
                maxLength={12}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">8 caractères alphanumériques.</p>
          </div>
          <Button onClick={handleStart} disabled={loading || !code.trim()} size="lg" className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Générer mon test"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
