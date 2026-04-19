import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import type { UserRole } from "@prisma/client";

/**
 * Configuration NextAuth — Cahier des charges §3.1
 * Support : Email+Mot de passe, Google, GitHub, LinkedIn, Facebook
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 }, // 7 jours (cf §8.3)
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [
    CredentialsProvider({
      name: "Email + mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || user.email,
          image: user.profileImageUrl,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "openid profile email" } },
      issuer: "https://www.linkedin.com",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as { id: string }).id;
        token.role = (user as { role?: UserRole }).role ?? "STUDENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string;
        (session.user as { role?: UserRole }).role = token.role as UserRole;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Assurer la création d'un StudentProfile si le rôle n'est pas défini
      if (account && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          include: { profile: true },
        });
        if (existing && !existing.profile && existing.role === "STUDENT") {
          await prisma.studentProfile.create({ data: { userId: existing.id } });
        }
        // Capter nom/prénom depuis le provider si absent
        if (existing && (!existing.firstName || !existing.lastName) && profile) {
          const p = profile as { given_name?: string; family_name?: string; name?: string };
          const firstName = p.given_name ?? p.name?.split(" ")[0];
          const lastName = p.family_name ?? p.name?.split(" ").slice(1).join(" ");
          await prisma.user.update({
            where: { id: existing.id },
            data: { firstName, lastName },
          });
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Créer automatiquement le StudentProfile vide
      if (user.id) {
        await prisma.studentProfile.create({
          data: { userId: user.id },
        });
      }
    },
  },
};
