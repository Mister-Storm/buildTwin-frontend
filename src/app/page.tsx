import Link from "next/link";
import {
  Activity,
  Building2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { ErrorState } from "@/components/shared/States";
import { getExecutiveDashboard } from "@/features/dashboard/get-executive-dashboard";

export default async function DashboardPage() {
  const dashboard = await getExecutiveDashboard();

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
              href="/projects"
              className="mt-6 inline-flex items-center rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Ver Obras
            </Link>
          </div>
        </section>

        <PageHeader
          title="Visão Executiva"
          description="Indicadores operacionais da plataforma BuildTwin."
        />

        {dashboard.isUnavailable ? (
          <ErrorState
            title="Backend indisponível"
            message="Não foi possível carregar os indicadores. Verifique se o backend está rodando em http://localhost:8080."
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={dashboard.activeProjects.label}
            value={dashboard.activeProjects.value}
            subtitle={dashboard.activeProjects.subtitle}
            icon={Building2}
          />
          <MetricCard
            label={dashboard.lastFlight.label}
            value={dashboard.lastFlight.value}
            subtitle={dashboard.lastFlight.subtitle}
            icon={Calendar}
          />
          <MetricCard
            label={dashboard.processedFlights.label}
            value={dashboard.processedFlights.value}
            subtitle={dashboard.processedFlights.subtitle}
            icon={CheckCircle2}
          />
          <MetricCard
            label={dashboard.completedProcessings.label}
            value={dashboard.completedProcessings.value}
            subtitle={dashboard.completedProcessings.subtitle}
            icon={Activity}
          />
        </div>
      </div>
    </AppShell>
  );
}
