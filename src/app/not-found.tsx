import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function NotFound() {
  return (
    <AppShell breadcrumbs={[{ label: "Não encontrado" }]}>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">
          O recurso solicitado não foi encontrado.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Ir para o Login
        </Link>
      </div>
    </AppShell>
  );
}
