/**
 * Script : crée un code de test DEMO directement en DB.
 * Usage : npx tsx scripts/demo-code.ts
 *
 * Génère un code valable 30 jours, utilisable 50 fois, pour tester l'app.
 * Sans nécessiter de compte admin.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const DEMO_CODE = "DEMO2025";
  const daysValid = 30;
  const maxUsage = 50;

  // Trouver (ou créer) un admin fictif pour satisfaire la FK createdByAdminId
  let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: "demo-admin@watc.local",
        role: "ADMIN",
        firstName: "Demo",
        lastName: "Admin",
        emailVerified: new Date(),
      },
    });
    console.log(`✓ Admin fictif créé : ${admin.email}`);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);

  const existing = await prisma.testCode.findUnique({ where: { code: DEMO_CODE } });
  if (existing) {
    await prisma.testCode.update({
      where: { id: existing.id },
      data: {
        maxUsage,
        expiresAt,
        status: "ACTIVE",
        usedCount: 0,
        note: "Code DEMO régénéré",
      },
    });
    console.log(`♻  Code DEMO rafraîchi : ${DEMO_CODE}`);
  } else {
    await prisma.testCode.create({
      data: {
        code: DEMO_CODE,
        maxUsage,
        expiresAt,
        note: "Code DEMO — test de l'app",
        status: "ACTIVE",
        createdByAdminId: admin.id,
      },
    });
    console.log(`✓ Code DEMO créé : ${DEMO_CODE}`);
  }

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`   🔑  CODE DE TEST : ${DEMO_CODE}`);
  console.log(`   Valide ${daysValid} jours · ${maxUsage} utilisations`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
