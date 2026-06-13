import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArtifactCard } from "@/components/shared/ArtifactCard";
import { EmptyState } from "@/components/shared/States";
import { loadOrthomosaicViewModel } from "@/features/orthomosaic-viewer/load-orthomosaic-view-model";
import { getProject } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";

type OrthomosaicPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ flightId?: string }>;
};

export default async function OrthomosaicPage({
  params,
  searchParams,
}: OrthomosaicPageProps) {
  const { projectId } = await params;
  const { flightId } = await searchParams;

  let projectName = "Obra";

  try {
    const project = await getProject(projectId);
    projectName = project.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
  }

  const viewModel = await loadOrthomosaicViewModel(
    projectId,
    flightId,
  ).catch(() => null);

  return (
    <AppShell
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos", href: "/projects" },
        { label: projectName, href: `/projects/${projectId}` },
        { label: "Ortomosaico" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Visualizador de Ortomosaico"
          description="Preview processado pelo pipeline BuildTwin — Drone → Upload → Worker → Processor → NodeODM → Preview."
        />

        {!viewModel ? (
          <EmptyState
            title="Ortomosaico não disponível"
            message="Configure ORTHOMOSAIC_MAPPINGS no .env.local com projectId, flightId e jobId após processar um voo. Consulte o README."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-primary shadow-inner">
              {/* map-container: future Leaflet | OpenLayers | Cesium */}
              {/* eslint-disable-next-line @next/next/no-img-element -- API binary preview stream */}
              <img
                src={viewModel.previewUrl}
                alt={`Ortomosaico da obra ${projectName}`}
                className="max-h-[70vh] w-full object-contain p-4"
              />
            </div>
            <ArtifactCard viewModel={viewModel} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
