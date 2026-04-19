import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const [preinscrits, inscrits] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT", profile: { completionPct: { lt: 100 } } },
      include: { profile: true, bookings: { include: { payment: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", profile: { completionPct: 100 } },
      include: { profile: true, bookings: { include: { payment: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des inscriptions</h1>
          <p className="mt-1 text-muted-foreground">Pré-inscrits (profil incomplet) · Inscrits (profil + paiement).</p>
        </div>
        <Button variant="outline"><UserCog className="h-4 w-4" /> Export CSV</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pré-inscrits ({preinscrits.length})</CardTitle>
          <CardDescription>Profil incomplet — relancer ou valider manuellement.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable users={preinscrits} preinscrit />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inscrits ({inscrits.length})</CardTitle>
          <CardDescription>Profil complet + paiement reçu.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable users={inscrits} />
        </CardContent>
      </Card>
    </div>
  );
}

function UserTable({
  users,
  preinscrit = false,
}: {
  users: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
    profile: { completionPct: number; status: string } | null;
    bookings: { payment: { status: string } | null }[];
  }>;
  preinscrit?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-muted-foreground">
            <th className="pb-2">Nom</th>
            <th className="pb-2">Email</th>
            <th className="pb-2">Inscrit le</th>
            <th className="pb-2">Profil</th>
            <th className="pb-2">Paiement</th>
            <th className="pb-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-muted-foreground">
                Aucun utilisateur.
              </td>
            </tr>
          )}
          {users.map((u) => {
            const paymentStatus = u.bookings[0]?.payment?.status ?? "—";
            return (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{u.firstName} {u.lastName}</td>
                <td className="py-3 text-muted-foreground">{u.email}</td>
                <td className="py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="py-3">
                  <Badge variant={u.profile?.completionPct === 100 ? "success" : "warning"}>
                    {u.profile?.completionPct ?? 0}%
                  </Badge>
                </td>
                <td className="py-3">
                  <Badge variant={paymentStatus === "PAID" ? "success" : paymentStatus === "PENDING" ? "warning" : "outline"}>
                    {paymentStatus}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <Button size="sm" variant="outline">Voir</Button>
                  {preinscrit && <Button size="sm" variant="ghost" className="ml-1">Relancer</Button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
