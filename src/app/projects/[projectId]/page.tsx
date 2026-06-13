import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlightTimeline } from "@/components/shared/FlightTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { EmptyState } from "@/components/shared/States";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toProjectDashboardView } from "@/features/domain/mappers/dashboard.mapper";
import { mergeFlightsWithDashboard } from "@/features/domain/mappers/flight.mapper";
import { toProjectDetail } from "@/features/domain/mappers/project.mapper";
import type { FlightTimelineEntry } from "@/features/domain/models/flight";
import type { ProjectDetail } from "@/features/domain/models/project";
import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";
import { DEMO_ENABLED, isDemoProject } from "@/features/demo/demo-seed";
import { getOrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import { MockOrthomosaicResolver } from "@/features/domain/resolvers/mock-orthomosaic-resolver";
import { getProjectDashboard } from "@/services/dashboard.service";
import { listFlightsByProject } from "@/services/flights.service";
import { getProject } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";
import { formatDate, projectStatusLabel } from "@/lib/formatters";
import { ImageIcon, MapPin } from "lucide-react";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

type ProjectDetailData = {
  project: ProjectDetail;
  totalFlights: number;
  flightsByStatus: Record<string, number>;
  timeline: FlightTimelineEntry[];
  latestResolution: OrthomosaicResolution | null;
};

async function loadProjectDetail(projectId: string): Promise<ProjectDetailData> {
  const [projectDto, dashboardDto, flightsDto] = await Promise.all([
    getProject(projectId),
    getProjectDashboard(projectId),
    listFlightsByProject(projectId),
  ]);

  const resolver = getOrthomosaicResolver();
  const orthomosaicFlightIds =
    resolver instanceof MockOrthomosaicResolver
      ? resolver.getMappedFlightIds()
      : new Set<string>();

  const project = toProjectDetail(projectDto);
  const dashboard = toProjectDashboardView(dashboardDto, orthomosaicFlightIds);
  const timeline = mergeFlightsWithDashboard(
    flightsDto,
    dashboardDto.recentFlights,
    orthomosaicFlightIds,
  );
  const latestResolution = await resolver.resolveLatestForProject(projectId);

  return {
    project,
    totalFlights: dashboard.totalFlights,
    flightsByStatus: dashboard.flightsByStatus,
    timeline,
    latestResolution,
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;

  let data: ProjectDetailData;
  try {
    data = await loadProjectDetail(projectId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const { project, totalFlights, flightsByStatus, timeline, latestResolution } =
    data;
  const statusVariant = project.status === "active" ? "success" : "neutral";

  return (
    <AppShell
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos", href: "/projects" },
        { label: project.name },
      ]}
    >
      <div className="space-y-8">
        <PageHeader
          title={project.name}
          description={`${project.city}, ${project.state} · ${project.country}`}
          actions={
            latestResolution ? (
              <Link
                href={`/projects/${projectId}/orthomosaic?flightId=${latestResolution.flightId}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-accent px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <ImageIcon className="size-4" />
                View Orthomosaic
              </Link>
            ) : undefined
          }
        />

        {DEMO_ENABLED && isDemoProject(projectId) ? (
          <DemoBanner message="Obra de demonstração — clique em View Orthomosaic ou em um voo na timeline para ver o preview." />
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription>Status da Obra</CardDescription>
              <CardTitle className="flex items-center gap-2 text-lg">
                <StatusBadge
                  label={projectStatusLabel(project.status === "archived")}
                  variant={statusVariant}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Início: {formatDate(project.startDate)}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription>Total de Voos</CardDescription>
              <CardTitle className="text-3xl font-bold">{totalFlights}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription>Localização</CardDescription>
              <CardTitle className="flex items-start gap-2 text-base font-medium">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-support" />
                {project.address}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Evolução Temporal</h2>
            <p className="text-sm text-muted-foreground">
              Linha do tempo de voos — acompanhe a evolução da obra.
            </p>
          </div>
          {timeline.length > 0 ? (
            <FlightTimeline projectId={projectId} flights={timeline} />
          ) : (
            <EmptyState
              title="Nenhum voo registrado"
              message="Esta obra ainda não possui voos de drone cadastrados."
            />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Status por Fase</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(flightsByStatus).map(([status, count]) => (
              <StatusBadge
                key={status}
                label={`${status}: ${count}`}
                variant="neutral"
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
