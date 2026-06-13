import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { ErrorState } from "@/components/shared/States";
import { getDemoPageData } from "@/features/demo/get-demo-page-data";
import { cn } from "@/lib/utils";
import {
  Activity,
  Building2,
  CheckCircle2,
  Clock,
  Plane,
} from "lucide-react";

export default async function DemoPage() {
  const data = await getDemoPageData();

  return (
    <AppShell breadcrumbs={[{ label: "Demo Comercial" }]}>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary via-primary to-brand-accent/80 px-8 py-10 text-primary-foreground shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              BuildTwin Demo
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">
              Demonstração para Construtoras
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80 lg:text-base">
              Fluxo operacional completo — da obra ao ortomosaico — com dados
              reais da plataforma.
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
          title="Resumo Executivo"
          description="Indicadores consolidados das obras ativas."
        />

        {data.isUnavailable ? (
          <ErrorState
            title="Backend indisponível"
            message="Inicie o backend BuildTwin para carregar os indicadores de demonstração."
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Obras Ativas"
            value={String(data.activeProjects)}
            subtitle={`${data.totalProjects} no total`}
            icon={Building2}
          />
          <MetricCard
            label="Voos"
            value={String(data.totalFlights)}
            subtitle="Cadastrados nas obras ativas"
            icon={Plane}
          />
          <MetricCard
            label="Processados"
            value={String(data.processedJobs)}
            subtitle="Jobs concluídos"
            icon={CheckCircle2}
          />
          <MetricCard
            label="Pendentes"
            value={String(data.pendingJobs)}
            subtitle="Aguardando ou em execução"
            icon={Clock}
          />
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <h3 className="text-lg font-semibold">Checklist da Demonstração</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Progresso do fluxo na obra mais recente.
            </p>
            <ul className="mt-4 space-y-3">
              {data.checklist.map((item) => (
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
                      item.completed ? "font-medium" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-6">
            <h3 className="text-lg font-semibold">Próximos Passos</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Siga o fluxo operacional pela interface.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Criar uma obra em Projetos</li>
              <li>Registrar um voo de drone</li>
              <li>Enviar imagens JPG/PNG</li>
              <li>Processar e acompanhar o status</li>
              <li>Visualizar e baixar os resultados</li>
            </ol>
            <Link
              href="/projects"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-accent hover:underline"
            >
              <Activity className="size-4" />
              Ir para Projetos
            </Link>
          </div>
        </section>

        {data.recentProjects.length > 0 ? (
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">Últimas Obras</h3>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
