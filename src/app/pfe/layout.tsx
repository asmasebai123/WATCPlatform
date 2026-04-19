import { AppSidebar } from "@/components/app-sidebar";

export default function PFELayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
