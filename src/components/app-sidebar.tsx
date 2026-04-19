"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  User,
  Brain,
  GraduationCap,
  Briefcase,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  Users,
  KeySquare,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STUDENT_NAV = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/onboarding", label: "Mon profil", icon: User },
  { href: "/test", label: "Test IA", icon: Brain },
  { href: "/pfe", label: "Mon PFE", icon: GraduationCap },
  { href: "/formations", label: "Formations", icon: BookOpen },
  { href: "/careers", label: "Emploi", icon: Briefcase },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Accueil", icon: LayoutDashboard },
  { href: "/admin/users", label: "Inscriptions", icon: Users },
  { href: "/admin/codes", label: "Codes test", icon: KeySquare },
  { href: "/admin/reports", label: "Rapports", icon: Brain },
  { href: "/admin/pfe", label: "PFE", icon: GraduationCap },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data } = useSession();
  const isAdmin = (data?.user as { role?: string })?.role === "ADMIN";
  const nav = isAdmin && pathname.startsWith("/admin") ? ADMIN_NAV : STUDENT_NAV;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white md:flex">
      <Link href="/" className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md watc-gradient text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold text-watc-primary">WATC</span>
      </Link>

      <nav className="flex-1 space-y-1 p-4">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-watc-primary text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        {isAdmin && (
          <Link
            href={pathname.startsWith("/admin") ? "/dashboard" : "/admin"}
            className="mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            {pathname.startsWith("/admin") ? "Espace étudiant" : "Back-office"}
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
