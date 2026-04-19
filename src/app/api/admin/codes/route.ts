import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { generateTestCode } from "@/lib/utils";

const schema = z.object({
  maxUsage: z.coerce.number().int().min(1).max(20).default(1),
  daysValid: z.coerce.number().int().min(1).max(365).default(7),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  const { maxUsage, daysValid, note } = schema.parse(await req.json());
  let code = generateTestCode(8);
  // Garantir l'unicité
  while (await prisma.testCode.findUnique({ where: { code } })) {
    code = generateTestCode(8);
  }
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);
  const created = await prisma.testCode.create({
    data: {
      code,
      maxUsage,
      expiresAt,
      note,
      createdByAdminId: session.user.id,
    },
  });
  return NextResponse.json({ id: created.id, code: created.code });
}

export async function GET() {
  await requireAdmin();
  const codes = await prisma.testCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ codes });
}
