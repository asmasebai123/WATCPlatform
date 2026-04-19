import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeGenerator } from "@/components/admin/code-generator";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminCodesPage() {
  const codes = await prisma.testCode.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Codes d&apos;accès aux tests</h1>
      <p className="mt-1 text-muted-foreground">Génération, suivi, révocation des codes étudiants.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <CodeGenerator />
        </div>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Codes récents</CardTitle>
            <CardDescription>Actifs · Expirés · Révoqués · Épuisés</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2">Utilisations</th>
                  <th className="pb-2">Expire</th>
                  <th className="pb-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {codes.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Aucun code généré.</td></tr>
                )}
                {codes.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 font-mono font-semibold">{c.code}</td>
                    <td className="py-3">
                      <Badge variant={c.status === "ACTIVE" ? "success" : c.status === "EXPIRED" ? "warning" : "outline"}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3">{c.usedCount}/{c.maxUsage}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(c.expiresAt)}</td>
                    <td className="py-3 text-muted-foreground">{c.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
