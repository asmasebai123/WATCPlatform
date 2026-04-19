"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function CodeGenerator() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  async function generate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxUsage: Number(form.get("maxUsage")),
          daysValid: Number(form.get("daysValid")),
          note: form.get("note"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setLastCode(data.code);
      toast({ variant: "success", message: `Code ${data.code} généré.` });
      router.refresh();
    } catch (err) {
      toast({ variant: "error", message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau code</CardTitle>
        <CardDescription>Code à usage unique par défaut, valide 7 jours.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={generate} className="space-y-3">
          <div>
            <Label htmlFor="maxUsage">Utilisations</Label>
            <Input id="maxUsage" name="maxUsage" type="number" min={1} max={10} defaultValue={1} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="daysValid">Validité (jours)</Label>
            <Input id="daysValid" name="daysValid" type="number" min={1} max={90} defaultValue={7} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="note">Note (optionnel)</Label>
            <Input id="note" name="note" placeholder="Cohorte juin 2025" className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Générer</>}
          </Button>
        </form>

        {lastCode && (
          <div className="mt-4 rounded-md border border-watc-success bg-green-50 p-3">
            <div className="text-xs text-muted-foreground">Code généré</div>
            <div className="flex items-center justify-between">
              <code className="text-xl font-bold tracking-widest text-watc-success">{lastCode}</code>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(lastCode);
                  toast({ variant: "success", message: "Copié !" });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
