import Link from "next/link";
import { LoginForm } from "@/components/auth-login-form";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center watc-gradient-subtle px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg watc-gradient text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-watc-primary">WATC</span>
        </Link>

        <div className="rounded-xl border bg-white p-8 shadow-lg">
          <h1 className="mb-1 text-2xl font-bold">Bon retour parmi nous 👋</h1>
          <p className="mb-6 text-sm text-muted-foreground">Connectez-vous à votre espace WATC.</p>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium text-watc-secondary hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
