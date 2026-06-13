import type { OrthomosaicViewModel } from "@/features/domain/models/orthomosaic";
import {
  DEMO_ORTHOMOSAIC_PREVIEW_URL,
  DEMO_FLIGHT_ID,
  DEMO_JOB_ID,
  DEMO_PREVIEW_ARTIFACT_ID,
  DEMO_PROJECT_ID,
  isDemoProject,
} from "@/features/demo/demo-seed";

export function buildDemoOrthomosaicViewModel(
  projectId: string = DEMO_PROJECT_ID,
  flightId: string = DEMO_FLIGHT_ID,
): OrthomosaicViewModel {
  return {
    projectId,
    flightId,
    jobId: DEMO_JOB_ID,
    previewArtifactId: DEMO_PREVIEW_ARTIFACT_ID,
    downloadArtifactId: null,
    previewUrl: DEMO_ORTHOMOSAIC_PREVIEW_URL,
    downloadUrl: null,
    flightDate: new Date("2026-06-12"),
    operatorName: "Jane Doe",
    jobStatus: "Concluído",
    jobStatusVariant: "success",
    fileSizeBytes: 2457600,
    fileSizeLabel: "2.3 MB",
    processedAt: new Date("2026-06-12T14:30:00Z"),
    width: 1600,
    height: 900,
  };
}

export function canUseDemoOrthomosaic(
  projectId: string,
  flightId?: string,
): boolean {
  if (!isDemoProject(projectId)) return false;
  if (!flightId || flightId === DEMO_FLIGHT_ID) return true;
  return false;
}
