import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";

/**
 * Webhook Stripe — appelle /api/payment/webhook après paiement.
 * Configurer l'endpoint dans le Dashboard Stripe + STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "not configured" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-09-30.acacia" });
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `signature: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      await prisma.$transaction([
        prisma.payment.updateMany({
          where: { externalId: session.id },
          data: { status: "PAID" },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
