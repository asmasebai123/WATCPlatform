import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(40),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, username, firstName, lastName } = schema.parse(body);

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username }] },
    });
    if (exists) {
      return NextResponse.json({ error: "Email ou nom d'utilisateur déjà pris." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        firstName,
        lastName,
        passwordHash,
        role: "STUDENT",
        profile: { create: {} },
      },
      select: { id: true, email: true, username: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Données invalides." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
