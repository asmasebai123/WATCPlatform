"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  Send,
  Loader2,
  Brain,
  Globe2,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  section: "TECHNICAL" | "FRENCH" | "ENGLISH" | "SOFT_SKILLS";
  type: string;
  prompt: string;
  options: Record<string, string> | null;
  order: number;
}

const SECTION_META: Record<Question["section"], { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  TECHNICAL: { label: "Test technique", icon: Brain },
  FRENCH: { label: "Français", icon: Globe2 },
  ENGLISH: { label: "Anglais", icon: Globe2 },
  SOFT_SKILLS: { label: "Soft skills", icon: Lightbulb },
};

const SECTION_ORDER: Question["section"][] = ["TECHNICAL", "FRENCH", "ENGLISH", "SOFT_SKILLS"];

const QUESTION_DURATION = 30; // §4.4 — 30 secondes strict par question

export function TestRunner({
  sessionId,
  questions,
}: {
  sessionId: string;
  questions: Question[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, { value: string; timeSpent: number; timedOut: boolean }>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const answeredRef = useRef(false);

  const ordered = useMemo(
    () => [...questions].sort((a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section) || a.order - b.order),
    [questions]
  );
  const current = ordered[currentIdx];
  const completed = currentIdx >= ordered.length;

  // Timer
  useEffect(() => {
    if (completed) return;
    answeredRef.current = false;
    setTimeLeft(QUESTION_DURATION);
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          if (!answeredRef.current) handleNext(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  function handleAnswer(value: string) {
    setAnswers((a) => ({
      ...a,
      [current.id]: { value, timeSpent: QUESTION_DURATION - timeLeft, timedOut: false },
    }));
  }

  function handleNext(timedOut = false) {
    answeredRef.current = true;
    const val = answers[current?.id]?.value ?? "";
    setAnswers((a) => ({
      ...a,
      [current.id]: { value: val, timeSpent: QUESTION_DURATION - timeLeft, timedOut },
    }));
    if (currentIdx + 1 >= ordered.length) {
      setCurrentIdx(ordered.length); // passer à l'écran de confirmation
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        sessionId,
        answers: ordered.map((q) => ({
          questionId: q.id,
          value: answers[q.id]?.value ?? null,
          timeSpentSec: answers[q.id]?.timeSpent ?? QUESTION_DURATION,
          timedOut: answers[q.id]?.timedOut ?? false,
        })),
      };
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de soumission");
      toast({ variant: "success", title: "Test soumis", message: "Votre rapport est prêt." });
      router.push("/test/results");
    } catch (err) {
      toast({ variant: "error", message: (err as Error).message });
      setSubmitting(false);
    }
  }

  const total = ordered.length;
  const progress = Math.round(((currentIdx) / Math.max(total, 1)) * 100);
  const sections = SECTION_ORDER.filter((s) => ordered.some((q) => q.section === s));
  const currentSection = current?.section;

  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-lg rounded-xl border bg-white p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-watc-success" />
          <h1 className="text-2xl font-bold">Toutes les sections terminées</h1>
          <p className="mt-2 text-muted-foreground">
            Confirmez la soumission pour générer votre rapport IA.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentIdx(ordered.length - 1)}
              disabled={submitting}
              className="flex-1"
            >
              Revoir la dernière
            </Button>
            <Button
              onClick={() => setConfirmSubmit(true)}
              disabled={submitting}
              className="flex-1"
            >
              <Send className="h-4 w-4" /> Soumettre
            </Button>
          </div>

          {confirmSubmit && (
            <div className="mt-6 rounded-md border-2 border-watc-warning bg-orange-50 p-4 text-sm text-orange-900">
              <div className="font-semibold">Confirmez la soumission définitive</div>
              <div className="mt-1">Aucun retour possible après validation.</div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmSubmit(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" size="sm" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer la soumission"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar sections (§4.4) */}
      <aside className="hidden w-64 shrink-0 border-r bg-white p-4 md:block">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-watc-primary">
          <Brain className="h-5 w-5" /> WATC Test IA
        </div>
        <div className="space-y-4">
          {sections.map((s) => {
            const Icon = SECTION_META[s].icon;
            const sectionQs = ordered.filter((q) => q.section === s);
            const firstIdx = ordered.indexOf(sectionQs[0]);
            const lastIdx = ordered.indexOf(sectionQs[sectionQs.length - 1]);
            const isActive = currentSection === s;
            const isDone = currentIdx > lastIdx;
            const answeredCount = sectionQs.filter((q) => answers[q.id]?.value).length;
            return (
              <div
                key={s}
                className={cn(
                  "rounded-md border p-3 text-xs",
                  isActive && "border-watc-primary bg-blue-50",
                  isDone && "border-watc-success bg-green-50"
                )}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Icon className="h-4 w-4" /> {SECTION_META[s].label}
                </div>
                <div className="mt-1 text-muted-foreground">
                  {answeredCount}/{sectionQs.length} · Q{firstIdx + 1}–Q{lastIdx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main question area */}
      <div className="flex-1 p-6">
        {/* En-tête : barre progression + timer */}
        <div className="mx-auto mb-6 max-w-3xl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="ai">{SECTION_META[currentSection].label}</Badge>
              <span className="text-muted-foreground">
                Question {currentIdx + 1} sur {total}
              </span>
            </div>
            <TimerPill timeLeft={timeLeft} />
          </div>
          <Progress value={progress} />
        </div>

        {/* Question card */}
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4">
            <Badge variant="outline" className="mb-2 text-xs">{current.type}</Badge>
            <div className="whitespace-pre-wrap text-base font-medium">{current.prompt}</div>
          </div>

          <QuestionInput
            question={current}
            value={answers[current.id]?.value ?? ""}
            onChange={handleAnswer}
          />

          <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
            <span>⚠️ Pas de retour en arrière possible une fois validée.</span>
            <Button onClick={() => handleNext(false)} size="lg">
              {currentIdx + 1 === ordered.length ? "Terminer" : "Suivant"} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimerPill({ timeLeft }: { timeLeft: number }) {
  const danger = timeLeft <= 10;
  return (
    <div className={cn(
      "flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold",
      danger ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
    )}>
      <Clock className="h-4 w-4" /> {timeLeft}s
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  if (question.type === "QCM" && question.options) {
    return (
      <div className="space-y-2">
        {Object.entries(question.options).map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "flex w-full items-start gap-3 rounded-md border p-3 text-left transition",
              value === key ? "border-watc-primary bg-blue-50" : "hover:border-watc-accent"
            )}
          >
            {value === key ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-watc-primary" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
            <div><span className="mr-2 font-bold">{key}.</span> {text}</div>
          </button>
        ))}
      </div>
    );
  }
  if (question.type === "TRUE_FALSE") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {["Vrai", "Faux"].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-md border p-4 font-semibold transition",
              value === opt ? "border-watc-primary bg-blue-50 text-watc-primary" : "hover:border-watc-accent"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }
  return (
    <Textarea
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Votre réponse…"
      rows={question.type === "CODE_COMPLETION" ? 8 : 4}
      className={question.type === "CODE_COMPLETION" ? "font-mono text-sm" : ""}
    />
  );
}
