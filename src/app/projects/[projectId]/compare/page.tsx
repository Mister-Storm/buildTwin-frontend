import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { ComparisonInsightsCard } from "@/features/temporal-comparison/ComparisonInsightsCard";
import { FlightComparisonSelector } from "@/features/temporal-comparison/FlightComparisonSelector";
import { loadComparisonViewModel } from "@/features/temporal-comparison/load-comparison-view-model";
import { TemporalComparisonCard } from "@/features/temporal-comparison/TemporalComparisonCard";
import { TemporalComparisonViewer } from "@/features/temporal-comparison/TemporalComparisonViewer";
import { getProject } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";

type ComparePageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ flightA?: string; flightB?: string }>;
};

export default async function ComparePage({
  params,
  searchParams,
}: ComparePageProps) {
  const { projectId } = await params;
  const { flightA, flightB } = await searchParams;

  let projectName = "Obra";
  try {
    const project = await getProject(projectId);
    projectName = project.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
  }

  const result = await loadComparisonViewModel(projectId, flightA, flightB);

  return (
    <AppShell
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos", href: "/projects" },
        { label: projectName, href: `/projects/${projectId}` },
        { label: "Comparar levantamentos" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Comparação Temporal"
          description="Compare dois levantamentos processados da mesma obra lado a lado."
        />

        {result.status === "success" ? (
          <div className="space-y-6">
            <FlightComparisonSelector
              projectId={projectId}
              timeline={result.timeline}
              flightAId={result.viewModel.flightA.flightId}
              flightBId={result.viewModel.flightB.flightId}
            />
            <TemporalComparisonCard viewModel={result.viewModel} />
            <ComparisonInsightsCard
              viewModel={result.viewModel}
              analytics={result.viewModel.analytics}
            />
            <TemporalComparisonViewer viewModel={result.viewModel} />
          </div>
        ) : result.status === "insufficient" ? (
          <div className="space-y-4">
            <ErrorState title="Comparação indisponível" message={result.message} />
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex h-9 items-center rounded-lg bg-brand-accent px-4 text-sm font-medium text-white"
            >
              Ver obra
            </Link>
          </div>
        ) : result.status === "empty" ? (
          <EmptyState
            title="Nenhum levantamento processado"
            message={result.message}
          />
        ) : (
          <ErrorState title="Erro ao carregar comparação" message={result.message} />
        )}
      </div>
    </AppShell>
  );
}
