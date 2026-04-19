"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

type KanbanStatus = "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: KanbanStatus;
  dueDate: Date | null;
  order: number;
}

const COLUMNS: { status: KanbanStatus; label: string; color: string }[] = [
  { status: "BACKLOG", label: "Backlog", color: "bg-slate-100 text-slate-700" },
  { status: "IN_PROGRESS", label: "En cours", color: "bg-blue-100 text-blue-700" },
  { status: "IN_REVIEW", label: "En révision", color: "bg-orange-100 text-orange-700" },
  { status: "DONE", label: "Terminé", color: "bg-green-100 text-green-700" },
];

export function KanbanBoard({ pfeId, tasks }: { pfeId: string; tasks: Task[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [draft, setDraft] = useState("");

  async function addTask() {
    if (!draft.trim()) return;
    const res = await fetch("/api/pfe/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pfeId, title: draft }),
    });
    if (res.ok) {
      setDraft("");
      router.refresh();
    } else toast({ variant: "error", message: "Ajout impossible" });
  }

  async function move(taskId: string, status: KanbanStatus) {
    const res = await fetch(`/api/pfe/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nouvelle tâche…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <Button onClick={addTask} size="sm">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="rounded-lg border bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", col.color)}>
                  {col.label}
                </div>
                <Badge variant="outline" className="text-xs">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <Card key={t.id} className="p-3 text-sm">
                    <div className="font-medium">{t.title}</div>
                    {t.description && <div className="mt-1 text-xs text-muted-foreground">{t.description}</div>}
                    <div className="mt-2 flex gap-1">
                      {COLUMNS.filter((c) => c.status !== t.status).map((c) => (
                        <button
                          key={c.status}
                          onClick={() => move(t.id, c.status)}
                          className="rounded bg-slate-200 px-2 py-0.5 text-[10px] hover:bg-slate-300"
                          title={`Déplacer vers ${c.label}`}
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </Card>
                ))}
                {items.length === 0 && (
                  <div className="rounded border border-dashed border-slate-300 p-4 text-center text-xs text-muted-foreground">
                    Aucune tâche
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
