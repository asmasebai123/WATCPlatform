"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CreditCard, Phone, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, formatCurrency } from "@/lib/utils";

const MAX_PER_DAY = 8;
const SLOTS = [
  { value: "MORNING", label: "09h00" },
  { value: "AFTERNOON", label: "13h00" },
  { value: "EVENING", label: "18h00" },
] as const;

const PRICE_MILLIMES = 80_000; // 80 TND

export function BookingCalendar({ occupancy }: { occupancy: Record<string, number> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<(typeof SLOTS)[number]["value"] | null>(null);
  const [method, setMethod] = useState<"STRIPE" | "D17" | "OFFLINE">("STRIPE");
  const [loading, setLoading] = useState(false);

  // Liste des 30 prochains jours ouvrés
  const days = useMemo(() => {
    const d: { iso: string; date: Date; full: boolean }[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 1; i < 45; i++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + i);
      const weekday = dt.getDay();
      if (weekday === 0 || weekday === 6) continue; // on skip weekend
      const iso = dt.toISOString().slice(0, 10);
      d.push({ iso, date: dt, full: (occupancy[iso] ?? 0) >= MAX_PER_DAY });
      if (d.length >= 30) break;
    }
    return d;
  }, [occupancy]);

  async function handleConfirm() {
    if (!selectedDate || !selectedSlot) return;
    setLoading(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          slot: selectedSlot,
          paymentMethod: method,
          amount: PRICE_MILLIMES,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Réservation impossible");

      if (method === "STRIPE" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (method === "OFFLINE") {
        toast({
          variant: "warning",
          title: "Contactez WATC",
          message: "Un administrateur vous contactera pour vérification téléphonique.",
        });
      } else {
        toast({ variant: "success", message: "Réservation confirmée." });
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast({ variant: "error", message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      {/* Calendrier */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Choisir une date</CardTitle>
          <CardDescription>Maximum {MAX_PER_DAY} étudiants par jour · 3 créneaux proposés.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {days.map((d) => {
              const isSelected = selectedDate === d.iso;
              return (
                <button
                  key={d.iso}
                  type="button"
                  disabled={d.full}
                  onClick={() => setSelectedDate(d.iso)}
                  className={cn(
                    "rounded-md border p-2 text-center text-sm transition",
                    isSelected && "border-watc-primary bg-watc-primary text-white",
                    d.full && "cursor-not-allowed opacity-40",
                    !isSelected && !d.full && "hover:border-watc-accent"
                  )}
                >
                  <div className="text-xs opacity-70">{d.date.toLocaleDateString("fr-FR", { weekday: "short" })}</div>
                  <div className="font-semibold">{d.date.getDate()}</div>
                  <div className="text-xs opacity-70">{d.date.toLocaleDateString("fr-FR", { month: "short" })}</div>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4" /> Créneaux du {formatDate(selectedDate)}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSelectedSlot(s.value)}
                    className={cn(
                      "rounded-md border p-3 text-sm transition",
                      selectedSlot === s.value ? "border-watc-primary bg-watc-primary text-white" : "hover:border-watc-accent"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Paiement</CardTitle>
          <CardDescription>Frais d&apos;évaluation : {formatCurrency(PRICE_MILLIMES)}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <PaymentOption
            selected={method === "STRIPE"}
            onClick={() => setMethod("STRIPE")}
            title="Carte bancaire"
            subtitle="Visa · Mastercard via Stripe"
          />
          <PaymentOption
            selected={method === "D17"}
            onClick={() => setMethod("D17")}
            title="D17 Mobile"
            subtitle="Paiement mobile tunisien"
          />
          <PaymentOption
            selected={method === "OFFLINE"}
            onClick={() => setMethod("OFFLINE")}
            title="Paiement hors-ligne"
            subtitle="Vérification téléphonique avec WATC"
          />

          {method === "OFFLINE" && (
            <div className="rounded-md border border-watc-warning bg-orange-50 p-3 text-xs text-orange-900">
              <AlertCircle className="mb-1 inline h-3.5 w-3.5" /> Un administrateur WATC vous contactera pour valider le paiement manuellement.
            </div>
          )}

          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedSlot || loading}
            className="mt-2 w-full"
            size="lg"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>{method === "STRIPE" ? "Payer maintenant" : "Confirmer ma réservation"}</>
            )}
          </Button>

          <Badge variant="outline" className="flex w-full items-center justify-center gap-1 py-2 text-xs">
            <Phone className="h-3 w-3" /> Besoin d&apos;aide ? contactez le +216 71 000 000
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentOption({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md border p-3 text-left transition",
        selected ? "border-watc-primary bg-blue-50" : "hover:border-watc-accent"
      )}
    >
      <div className={cn("h-4 w-4 rounded-full border-2", selected ? "border-watc-primary bg-watc-primary" : "border-border")} />
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  );
}
