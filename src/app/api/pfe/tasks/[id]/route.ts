import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";

const schema = z.object({
  status: z.enum(["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = schema.parse(await req.json());

  const task = await prisma.kanbanTask.findUnique({
    where: { id: params.id },
    include: { pfe: true },
  });
  if (!task) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (task.pfe.studentId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await prisma.kanbanTask.update({
    where: { id: params.id },
    data: { ...body },
  });

  // Mettre à jour le % du PFE automatiquement
  const all = await prisma.kanbanTask.findMany({ where: { pfeId: task.pfeId } });
  const done = all.filter((t) => t.status === "DONE").length;
  const progress = all.length > 0 ? Math.round((done / all.length) * 100) : 0;
  await prisma.pFE.update({ where: { id: task.pfeId }, data: { progress } });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const task = await prisma.kanbanTask.findUnique({
    where: { id: params.id },
    include: { pfe: true },
  });
  if (!task || task.pfe.studentId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await prisma.kanbanTask.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
