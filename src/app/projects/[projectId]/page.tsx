import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CaptureSessionTimeline } from "@/components/shared/CaptureSessionTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ErrorState } from "@/components/shared/States";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectCaptureSessionsEmpty } from "@/features/capture-session/project-capture-sessions-empty";
import { ProjectDetailActions } from "@/features/project/project-detail-actions";
import { toProjectDashboardView } from "@/features/domain/mappers/dashboard.mapper";
import { projectCaptureSessionsToTimeline } from "@/features/domain/mappers/capture-session.mapper";
import { toProjectDetail } from "@/features/domain/mappers/project.mapper";
import type { CaptureSessionTimelineEntry } from "@/features/domain/models/capture-session";
import type { ProjectDetail } from "@/features/domain/models/project";
import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";
import type { TimelineItemViewModel } from "@/features/domain/models/temporal-comparison";
import { ProcessedSurveyTimeline } from "@/features/temporal-comparison/ProcessedSurveyTimeline";
import { mapTimelineItems } from "@/features/temporal-comparison/timeline.mapper";
import { getOrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import { getProjectDashboard } from "@/services/dashboard.service";
import { listCaptureSessionsByProject } from "@/services/capture-sessions.service";
import { getProject } from "@/services/projects.service";
import { getProjectTimeline } from "@/services/timeline.service";
import { ApiError } from "@/types/api/common.api";
import { formatDate, projectStatusLabel } from "@/lib/formatters";
import { Calendar, CheckCircle2, Clock, MapPin, XCircle } from "lucide-react";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

type ProjectDetailData = {
  project: ProjectDetail;
  dashboard: ReturnType<typeof toProjectDashboardView>;
  timeline: CaptureSessionTimelineEntry[];
  latestResolution: OrthomosaicResolution | null;
  processedSurveyCount: number;
  processedSurveys: TimelineItemViewModel[];
};

async function loadProjectDetail(projectId: string): Promise<ProjectDetailData> {
  const [projectDto, dashboardDto, captureSessionsDto, timelineDto] = await Promise.all([
    getProject(projectId),
    getProjectDashboard(projectId),
    listCaptureSessionsByProject(projectId),
    getProjectTimeline(projectId).catch(() => ({ projectId, timeline: [] })),
  ]);

  const resolver = getOrthomosaicResolver();
  const orthomosaicCaptureSessionIds = resolver.getOrthomosaicCaptureSessionIds
    ? await resolver.getOrthomosaicCaptureSessionIds(projectId)
    : new Set<string>();

  const project = toProjectDetail(projectDto);
  const dashboard = toProjectDashboardView(dashboardDto, orthomosaicCaptureSessionIds);
  const timeline = projectCaptureSessionsToTimeline(captureSessionsDto, orthomosaicCaptureSessionIds);
  const latestResolution = await resolver.resolveLatestForProject(projectId);

  return {
    project,
    dashboard,
    timeline,
    latestResolution,
    processedSurveyCount: timelineDto.timeline.length,
    processedSurveys: mapTimelineItems(timelineDto.timeline),
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;

  let data: ProjectDetailData | null = null;
  let loadError: string | null = null;

  try {
    data = await loadProjectDetail(projectId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    loadError =
      error instanceof ApiError
        ? error.message
        : "Não foi possível carregar os dados da obra.";
  }

  if (loadError || !data) {
    return (
      <AppShell
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projetos", href: "/projects" },
          { label: "Obra" },
        ]}
      >
        <ErrorState title="Erro ao carregar obra" message={loadError ?? ""} />
      </AppShell>
    );
  }

  const { project, dashboard, timeline, latestResolution, processedSurveyCount, processedSurveys } = data;
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
            <ProjectDetailActions
              projectId={projectId}
              projectName={project.name}
              isArchived={project.status === "archived"}
              latestResolution={latestResolution}
              processedSurveyCount={processedSurveyCount}
            />
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              <CardDescription>Total de Capturas</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {dashboard.totalCaptureSessions}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                Processados
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-brand-accent">
                {dashboard.processedCaptureSessions}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Clock className="size-3.5" />
                Pendentes / Falhas
              </CardDescription>
              <CardTitle className="flex items-baseline gap-2 text-2xl font-bold">
                <span>{dashboard.pendingCaptureSessions}</span>
                <span className="text-base font-normal text-muted-foreground">
                  /
                </span>
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="size-4" />
                  {dashboard.failedCaptureSessions}
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription>Localização</CardDescription>
              <CardTitle className="flex items-start gap-2 text-base font-medium">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-support" />
                {project.address}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription>Última Captura</CardDescription>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Calendar className="size-4 text-brand-support" />
                {dashboard.latestCaptureSessionDate
                  ? formatDate(dashboard.latestCaptureSessionDate)
                  : "Nenhuma captura registrado"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Evolução Temporal</h2>
            <p className="text-sm text-muted-foreground">
              Linha do tempo de capturas — acompanhe a evolução da obra.
            </p>
          </div>
          {timeline.length > 0 ? (
            <CaptureSessionTimeline projectId={projectId} captureSessions={timeline} />
          ) : (
            <ProjectCaptureSessionsEmpty projectId={projectId} />
          )}
        </section>

        {processedSurveys.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Levantamentos Processados</h2>
              <p className="text-sm text-muted-foreground">
                Evolução da área monitorada entre levantamentos consecutivos.
              </p>
            </div>
            <ProcessedSurveyTimeline
              projectId={projectId}
              items={processedSurveys}
            />
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Status por Fase</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(dashboard.captureSessionsByStatus).map(([status, count]) => (
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
