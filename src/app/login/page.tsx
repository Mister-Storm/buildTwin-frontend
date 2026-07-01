"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogIn, AlertCircle } from "lucide-react";
import { login } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.roles.includes("ADMIN")) {
        router.push("/admin");
      } else {
        router.push("/demo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary to-brand-accent/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-brand-accent/15">
            <Building2 className="size-7 text-brand-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">BuildTwin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Construction Intelligence Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@buildtwin.io"
              required
              autoFocus
              className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="buildtwin123"
              required
              className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <LogIn className="size-4" />
            )}
            {loading ? "Autenticando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <span className="block">Demo: admin@buildtwin.io / buildtwin123</span>
          <span className="mt-1 block">
            Ative a segurança com BUILDTWIN_SECURITY_ENABLED=true
          </span>
        </p>
      </div>
    </div>
  );
}
