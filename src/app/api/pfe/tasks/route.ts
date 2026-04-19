import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";

const schema = z.object({
  pfeId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = schema.parse(await req.json());

  const pfe = await prisma.pFE.findUnique({ where: { id: body.pfeId } });
  if (!pfe || pfe.studentId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const count = await prisma.kanbanTask.count({ where: { pfeId: body.pfeId, status: "BACKLOG" } });
  const task = await prisma.kanbanTask.create({
    data: {
      pfeId: body.pfeId,
      title: body.title,
      description: body.description,
      order: count,
    },
  });
  return NextResponse.json({ task });
}
