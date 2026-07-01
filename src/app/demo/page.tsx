import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { ErrorState } from "@/components/shared/States";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  buildInfraChecklist,
  DemoEnvironmentSection,
} from "@/features/demo/demo-environment-section";
import { DemoRecentJobsTable } from "@/features/demo/demo-recent-jobs-table";
import { DemoSelfTestPanel } from "@/features/demo/demo-self-test-panel";
import { getDemoPageData } from "@/features/demo/get-demo-page-data";
import { PhotoMap } from "@/features/spatial-intelligence/PhotoMap";
import { fetchPhotoLocations } from "@/services/photo-geo.service";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Plane,
  XCircle,
} from "lucide-react";

function overallVariant(status: string) {
  switch (status) {
    case "UP":
      return "success" as const;
    case "DEGRADED":
      return "warning" as const;
    default:
      return "error" as const;
  }
}

export default async function DemoPage() {
  const data = await getDemoPageData();
  const photoLocations = await fetchPhotoLocations();
  const checklist = buildInfraChecklist({
    timestamp: data.timestamp,
    overallStatus: data.overallStatus,
    components: data.components,
    operations: data.operations,
  });

  return (
    <AppShell breadcrumbs={[{ label: "Demo Comercial" }]}>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary via-primary to-brand-accent/80 px-8 py-10 text-primary-foreground shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              BuildTwin Pilot Readiness
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">
              Demonstração para Construtoras
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80 lg:text-base">
              Valide a saúde da stack e acompanhe operações em tempo real antes
              de demos e pilotos em obra.
            </p>
            <Link
              href="/projects"
              className="mt-6 inline-flex items-center rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Gerenciar Obras
            </Link>
          </div>
        </section>

        <PageHeader
          title="Painel Operacional"
          description="Observabilidade da plataforma — Sprint 6C."
          actions={
            !data.isUnavailable ? (
              <StatusBadge
                label={`Stack ${data.overallStatus}`}
                variant={overallVariant(data.overallStatus)}
              />
            ) : null
          }
        />

        {data.isUnavailable ? (
          <ErrorState
            title="Backend indisponível"
            message="Inicie o backend BuildTwin para carregar o painel de demonstração completo. O mapa abaixo usa dados ilustrativos."
          />
        ) : null}

        {!data.isUnavailable ? (
          <>
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Ambiente</h3>
              <DemoEnvironmentSection
                overview={{
                  timestamp: data.timestamp,
                  overallStatus: data.overallStatus,
                  components: data.components,
                  operations: data.operations,
                }}
              />
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Estatísticas Operacionais</h3>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  label="Obras"
                  value={String(data.operations.projects)}
                  subtitle="Projetos ativos"
                  icon={Building2}
                />
                <MetricCard
                  label="Voos"
                  value={String(data.operations.captureSessions)}
                  subtitle="Cadastrados"
                  icon={Plane}
                />
                <MetricCard
                  label="Jobs"
                  value={String(data.operations.jobs)}
                  subtitle="Total de processamentos"
                  icon={Activity}
                />
                <MetricCard
                  label="Concluídos"
                  value={String(data.operations.processedJobs)}
                  subtitle="Jobs finalizados"
                  icon={CheckCircle2}
                />
                <MetricCard
                  label="Pendentes"
                  value={String(data.operations.pendingJobs)}
                  subtitle="Aguardando ou em execução"
                  icon={Clock}
                />
                <MetricCard
                  label="Falhos"
                  value={String(data.operations.failedJobs)}
                  subtitle="Jobs com erro"
                  icon={XCircle}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Últimos Processamentos</h3>
              <DemoRecentJobsTable jobs={data.operations.recentJobs} />
            </section>
          </>
        ) : null}

        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Mapa da Obra</h3>
          <PhotoMap
            locations={photoLocations}
            center={[-23.5505, -46.6333]}
            zoom={15}
          />
        </section>

        {!data.isUnavailable ? (
          <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-card p-6">
                <h3 className="text-lg font-semibold">
                  Checklist de Demonstração
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Infraestrutura necessária para uma demo comercial.
                </p>
                <ul className="mt-4 space-y-3">
                  {checklist.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full",
                          item.completed
                            ? "bg-brand-accent/15 text-brand-accent"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.completed ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Circle className="size-3" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          item.completed
                            ? "font-medium"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6">
                <h3 className="text-lg font-semibold">Self-Test Operacional</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Verificações reais de postgres, minio, processor e worker.
                </p>
                <div className="mt-4">
                  <DemoSelfTestPanel />
                </div>
                {data.components.processor?.status === "DEGRADED" ? (
                  <div className="mt-6 flex items-start gap-2 rounded-lg border border-brand-warning/30 bg-brand-warning/10 p-3 text-sm text-muted-foreground">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-brand-warning" />
                    <p>
                      Processor em estado DEGRADED
                      {data.components.processor.details
                        ? `: ${data.components.processor.details}`
                        : " — NodeODM indisponível ou lento. Verifique o container nodeodm."}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
    </AppShell>
  );
}
