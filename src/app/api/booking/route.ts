import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";

const MAX_PER_DAY = 8; // cahier des charges §3.4

const schema = z.object({
  date: z.string(),
  slot: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  paymentMethod: z.enum(["STRIPE", "D17", "OFFLINE"]),
  amount: z.number().int().positive(),
});

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = schema.parse(await req.json());
  const date = new Date(body.date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }
  date.setHours(0, 0, 0, 0);

  // Vérifier la contrainte des 8/jour
  const count = await prisma.booking.count({
    where: { date, status: { in: ["PENDING", "CONFIRMED"] } },
  });
  if (count >= MAX_PER_DAY) {
    return NextResponse.json({ error: "Ce jour est complet (max 8 étudiants)." }, { status: 409 });
  }

  // Vérifier absence de doublon
  const existing = await prisma.booking.findFirst({
    where: { userId: session.user.id, status: { in: ["PENDING", "CONFIRMED"] } },
  });
  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà une réservation en cours." }, { status: 409 });
  }

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      date,
      slot: body.slot,
      status: body.paymentMethod === "OFFLINE" ? "PENDING" : "PENDING",
    },
  });

  // Stripe Checkout
  if (body.paymentMethod === "STRIPE" && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-09-30.acacia" });
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "tnd",
            product_data: { name: "WATC — Évaluation & Test IA" },
            unit_amount: body.amount,
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: booking.id, userId: session.user.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/payment?payment=cancel`,
    });

    await prisma.payment.create({
      data: {
        userId: session.user.id,
        bookingId: booking.id,
        amount: body.amount,
        currency: "TND",
        method: "STRIPE",
        externalId: checkout.id,
      },
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  }

  // D17 ou OFFLINE : créer un Payment PENDING
  await prisma.payment.create({
    data: {
      userId: session.user.id,
      bookingId: booking.id,
      amount: body.amount,
      currency: "TND",
      method: body.paymentMethod,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true, bookingId: booking.id });
}
