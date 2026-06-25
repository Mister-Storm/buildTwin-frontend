import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArtifactCard } from "@/components/shared/ArtifactCard";
import { ErrorState } from "@/components/shared/States";
import { OrthomosaicMetricsCard } from "@/features/orthomosaic-viewer/OrthomosaicMetricsCard";
import {
  loadOrthomosaicViewModel,
  type OrthomosaicLoadError,
} from "@/features/orthomosaic-viewer/load-orthomosaic-view-model";
import { getProject } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";

type OrthomosaicPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ captureSessionId?: string }>;
};

const ERROR_MESSAGES: Record<OrthomosaicLoadError, { title: string; message: string }> = {
  NO_RESOLUTION: {
    title: "Ortomosaico não disponível",
    message:
      "Nenhuma captura com processamento concluído foi encontrado para esta obra.",
  },
  NO_PREVIEW: {
    title: "Preview não encontrado",
    message:
      "O job existe, mas ainda não há artifact ORTHOMOSAIC_PREVIEW disponível.",
  },
  JOB_NOT_FOUND: {
    title: "Processamento não encontrado",
    message: "O job de processamento solicitado não existe ou foi removido.",
  },
  ARTIFACT_NOT_FOUND: {
    title: "Artefato não encontrado",
    message: "O preview do ortomosaico não está disponível no storage.",
  },
  API_UNAVAILABLE: {
    title: "Backend indisponível",
    message:
      "Não foi possível carregar o ortomosaico. Verifique se o backend está rodando.",
  },
};

export default async function OrthomosaicPage({
  params,
  searchParams,
}: OrthomosaicPageProps) {
  const { projectId } = await params;
  const { captureSessionId } = await searchParams;

  let projectName = "Obra";

  try {
    const project = await getProject(projectId);
    projectName = project.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
  }

  const result = await loadOrthomosaicViewModel(projectId, captureSessionId);

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

        {result.status === "empty" ? (
          <ErrorState
            title={ERROR_MESSAGES[result.reason].title}
            message={ERROR_MESSAGES[result.reason].message}
          />
        ) : (
          <div className="space-y-6">
            <OrthomosaicMetricsCard viewModel={result.viewModel} />
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-primary shadow-inner">
              {/* map-container: future Leaflet | OpenLayers | Cesium */}
              {/* eslint-disable-next-line @next/next/no-img-element -- API binary preview stream via rewrite proxy */}
              <img
                src={result.viewModel.previewUrl}
                alt={`Ortomosaico da obra ${projectName}`}
                className="max-h-[70vh] w-full object-contain p-4"
              />
            </div>
            <ArtifactCard viewModel={result.viewModel} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
