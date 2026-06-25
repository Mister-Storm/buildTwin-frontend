import type { OrthomosaicViewModel } from "@/features/domain/models/orthomosaic";
import {
  DEMO_ORTHOMOSAIC_PREVIEW_URL,
  DEMO_FLIGHT_ID,
  DEMO_JOB_ID,
  DEMO_PREVIEW_ARTIFACT_ID,
  DEMO_PROJECT_ID,
  isDemoProject,
} from "@/features/demo/demo-seed";
import { parseDateOnly } from "@/lib/formatters";

export function buildDemoOrthomosaicViewModel(
  projectId: string = DEMO_PROJECT_ID,
  captureSessionId: string = DEMO_FLIGHT_ID,
): OrthomosaicViewModel {
  const captureDate = parseDateOnly("2026-06-12");

  return {
    projectId,
    captureSessionId,
    jobId: DEMO_JOB_ID,
    previewArtifactId: DEMO_PREVIEW_ARTIFACT_ID,
    downloadArtifactId: null,
    previewUrl: DEMO_ORTHOMOSAIC_PREVIEW_URL,
    downloadUrl: null,
    captureDate,
    operatorName: "Jane Doe",
    jobStatus: "Concluído",
    jobStatusVariant: "success",
    fileSizeBytes: 2457600,
    fileSizeLabel: "2.3 MB",
    processedAt: new Date("2026-06-12T14:30:00Z"),
    width: 1600,
    height: 900,
    captureDateLabel: "12 de jun. de 2026",
    areaLabel: "Não disponível",
    gsdLabel: "Não disponível",
    crs: "Não disponível",
    dimensionsLabel: "Não disponível",
    epsg: null,
    centerLat: null,
    centerLon: null,
    bounds: null,
  };
}

export function canUseDemoOrthomosaic(
  projectId: string,
  captureSessionId?: string,
): boolean {
  if (!isDemoProject(projectId)) return false;
  if (!captureSessionId || captureSessionId === DEMO_FLIGHT_ID) return true;
  return false;
}
