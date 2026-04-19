import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./options";
import type { UserRole } from "@prisma/client";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireUser(role?: UserRole) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");
  if (role && (session.user as { role?: UserRole }).role !== role) {
    redirect("/dashboard");
  }
  return session;
}

export async function requireAdmin() {
  return requireUser("ADMIN");
}
