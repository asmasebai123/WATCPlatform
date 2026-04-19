import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { TestGate } from "@/components/test/test-gate";
import { TestRunner } from "@/components/test/test-runner";

export default async function TestPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  // Test en cours ?
  const active = await prisma.testSession.findFirst({
    where: { userId: session.user.id, status: { in: ["GENERATED", "IN_PROGRESS"] } },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (active) {
    // Questions expurgées (sans correctAnswer côté client)
    const safeQuestions = active.questions.map((q) => ({
      id: q.id,
      section: q.section,
      type: q.type,
      prompt: q.prompt,
      options: q.options as Record<string, string> | null,
      order: q.order,
    }));
    return <TestRunner sessionId={active.id} questions={safeQuestions} />;
  }

  return <TestGate />;
}
