import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { BookingCalendar } from "@/components/booking-calendar";

export default async function PaymentPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile || (profile.completionPct ?? 0) < 60) {
    redirect("/onboarding");
  }

  // Agrégation des réservations par date
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 60);

  const bookings = await prisma.booking.groupBy({
    by: ["date", "slot"],
    where: { date: { gte: start, lte: end }, status: { in: ["PENDING", "CONFIRMED"] } },
    _count: true,
  });

  const occupancy: Record<string, number> = {};
  for (const b of bookings) {
    const day = b.date.toISOString().slice(0, 10);
    occupancy[day] = (occupancy[day] ?? 0) + b._count;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Réservation & Paiement</h1>
      <p className="mt-1 text-muted-foreground">
        Choisissez votre date, votre créneau, et réglez pour débloquer le test IA.
      </p>
      <BookingCalendar occupancy={occupancy} />
    </div>
  );
}
