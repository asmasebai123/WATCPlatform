import { requireAdmin } from "@/lib/auth/session";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
