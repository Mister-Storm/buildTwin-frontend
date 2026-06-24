import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { VerticalConstructionSection } from "@/features/vertical-construction/VerticalConstructionSection";
import { loadVerticalConstructionViewModel } from "@/features/vertical-construction/load-vertical-construction-view-model";
import { MaterialInventorySection } from "@/features/material-inventory/MaterialInventorySection";
import { loadMaterialInventoryViewModel } from "@/features/material-inventory/load-material-inventory-view-model";
import { MaterialConsumptionSection } from "@/features/material-consumption/MaterialConsumptionSection";
import { WasteIntelligenceSection } from "@/features/waste-intelligence/WasteIntelligenceSection";
import { BuiltAreaSection } from "@/features/built-area/BuiltAreaSection";
import { loadBuiltAreaViewModel } from "@/features/built-area/load-built-area-view-model";
import { ConstructionProgressCard } from "@/features/construction-progress/ConstructionProgressCard";
import { ConstructionProgressInsightsSection } from "@/features/construction-progress/ConstructionProgressInsightsSection";
import { ProjectPlanningCard } from "@/features/construction-progress/ProjectPlanningCard";
import { loadConstructionProgressViewModel } from "@/features/construction-progress/load-construction-progress-view-model";
import { loadProjectProgress } from "@/features/construction-progress/load-project-progress";
import { loadProjectProgressHistory } from "@/features/construction-progress/load-project-progress-history";
import { ProgressEvolutionChart } from "@/features/construction-progress/ProgressEvolutionChart";
import { ProgressHistoryChart } from "@/features/construction-progress/ProgressHistoryChart";
import { ProgressMetricsGrid } from "@/features/construction-progress/ProgressMetricsGrid";
import { ProgressOverviewCard } from "@/features/construction-progress/ProgressOverviewCard";
import { getProject } from "@/services/projects.service";
import { listFlightsByProject } from "@/services/flights.service";
import { ApiError } from "@/types/api/common.api";
import type { ProjectResponseDto } from "@/types/api/project.api";

type ProgressPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectProgressPage({ params }: ProgressPageProps) {
  const { projectId } = await params;

  let project: ProjectResponseDto | null = null;
  let projectLoadError: string | null = null;
  try {
    project = await getProject(projectId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    projectLoadError =
      error instanceof ApiError
        ? error.message
        : "Não foi possível carregar os dados da obra.";
  }

  const projectName = project?.name ?? "Obra";

  const [
    progressResult,
    historyResult,
    constructionProgressResult,
    builtAreaResult,
    verticalConstructionResult,
    materialInventoryResult,
    flights,
  ] = await Promise.all([
    loadProjectProgress(projectId),
    loadProjectProgressHistory(projectId),
    loadConstructionProgressViewModel(projectId),
    loadBuiltAreaViewModel(projectId),
    loadVerticalConstructionViewModel(projectId),
    loadMaterialInventoryViewModel(projectId),
    listFlightsByProject(projectId).catch(() => []),
  ]);

  return (
    <AppShell
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos", href: "/projects" },
        { label: projectName, href: `/projects/${projectId}` },
        { label: "Progresso da Obra" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Progresso da Obra"
          description="Indicadores de evolução baseados na área observada pelo ortomosaico."
        />

        {projectLoadError ? (
          <ErrorState
            title="Erro ao carregar planejamento"
            message={projectLoadError}
          />
        ) : project ? (
          <ProjectPlanningCard
            key={`${project.id}-${project.plannedAreaSquareMeters}-${project.plannedFloors}-${project.projectType}`}
            project={project}
          />
        ) : null}

        {builtAreaResult.status === "error" ? (
          <ErrorState
            title="Erro ao carregar área construída"
            message={builtAreaResult.message}
          />
        ) : builtAreaResult.status === "empty" ? (
          <div className="space-y-4">
            <BuiltAreaSection
              viewModel={builtAreaResult.viewModel}
              flights={flights}
            />
            <EmptyState
              title="Área construída não registrada"
              message={builtAreaResult.message}
            />
          </div>
        ) : (
          <BuiltAreaSection
            viewModel={builtAreaResult.viewModel}
            flights={flights}
          />
        )}

        {verticalConstructionResult.status === "error" ? (
          <ErrorState
            title="Erro ao carregar construção vertical"
            message={verticalConstructionResult.message}
          />
        ) : verticalConstructionResult.status === "empty" ? (
          <div className="space-y-4">
            <VerticalConstructionSection viewModel={verticalConstructionResult.viewModel} />
            <EmptyState
              title="Construção vertical não registrada"
              message={verticalConstructionResult.message}
            />
          </div>
        ) : (
          <VerticalConstructionSection viewModel={verticalConstructionResult.viewModel} />
        )}

        {materialInventoryResult.status === "error" ? (
          <ErrorState
            title="Erro ao carregar inventário de materiais"
            message={materialInventoryResult.message}
          />
        ) : materialInventoryResult.status === "empty" ? (
          <div className="space-y-4">
            <MaterialInventorySection
              projectId={projectId}
              viewModel={materialInventoryResult.viewModel}
              flights={flights}
            />
            <EmptyState
              title="Inventário não registrado"
              message={materialInventoryResult.message}
            />
          </div>
        ) : (
          <MaterialInventorySection
            projectId={projectId}
            viewModel={materialInventoryResult.viewModel}
            flights={flights}
          />
        )}

        <MaterialConsumptionSection projectId={projectId} flights={flights} />

        <WasteIntelligenceSection projectId={projectId} flights={flights} />

        {constructionProgressResult.status === "success" ? (
          <div className="space-y-6">
            <ConstructionProgressCard viewModel={constructionProgressResult.viewModel} />
            <ProgressEvolutionChart points={constructionProgressResult.viewModel.chartPoints} />
            <ConstructionProgressInsightsSection
              viewModel={constructionProgressResult.viewModel}
            />
          </div>
        ) : constructionProgressResult.status === "empty" ? (
          <EmptyState
            title="Ocupação indisponível"
            message={constructionProgressResult.message}
          />
        ) : null}

        {progressResult.status === "success" ? (
          <div className="space-y-6">
            <ProgressOverviewCard viewModel={progressResult.viewModel} />
            <ProgressMetricsGrid viewModel={progressResult.viewModel} />
            {historyResult.status === "success" ? (
              <ProgressHistoryChart history={historyResult.history} />
            ) : historyResult.status === "empty" ? (
              <EmptyState
                title="Histórico indisponível"
                message={historyResult.message}
              />
            ) : (
              <ErrorState title="Erro ao carregar histórico" message={historyResult.message} />
            )}
          </div>
        ) : progressResult.status === "empty" ? (
          <div className="space-y-4">
            <EmptyState title="Progresso indisponível" message={progressResult.message} />
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex h-9 items-center rounded-lg bg-brand-accent px-4 text-sm font-medium text-white"
            >
              Ver obra
            </Link>
          </div>
        ) : (
          <ErrorState title="Erro ao carregar progresso" message={progressResult.message} />
        )}
      </div>
    </AppShell>
  );
}
