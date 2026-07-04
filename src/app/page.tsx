import Link from "next/link";
import {
  Activity,
  Building2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientDashboard } from "@/features/dashboard/client-dashboard";

export default function DashboardPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary via-primary to-brand-accent/80 px-8 py-10 text-primary-foreground shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              BuildTwin
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">
              See Your Construction Site Evolve
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80 lg:text-base">
              Construction Intelligence Platform — acompanhamento visual e
              analítico de empreendimentos com drones, ortomosaicos e
              inteligência de obra.
            </p>
            <Link
              href="/demo"
              className="mt-6 inline-flex items-center rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Demo Comercial
            </Link>
          </div>
        </section>

        <PageHeader
          title="Visão Executiva"
          description="Indicadores operacionais da plataforma BuildTwin."
        />

        <ClientDashboard />
      </div>
    </AppShell>
  );
}
