import type { OrthomosaicViewModel } from "@/features/domain/models/orthomosaic";
import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";
import { getOrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import {
  findOrthomosaicDownloadArtifactId,
  findPreviewArtifactId,
} from "@/features/orthomosaic-viewer/artifact-utils";
import { mapOrthomosaicSurveyFields } from "@/features/orthomosaic-viewer/orthomosaic-metadata.mapper";
import { debugLog } from "@/lib/debug";
import {
  artifactDownloadUrl,
  artifactPreviewUrl,
} from "@/services/api-client";
import { getArtifact } from "@/services/artifacts.service";
import { getFlight } from "@/services/flights.service";
import { getJob } from "@/services/jobs.service";
import { ApiError } from "@/types/api/common.api";
import {
  formatFileSize,
  jobStatusLabel,
  jobStatusVariant,
  parseDateOnly,
} from "@/lib/formatters";

export type OrthomosaicLoadError =
  | "NO_RESOLUTION"
  | "NO_PREVIEW"
  | "JOB_NOT_FOUND"
  | "ARTIFACT_NOT_FOUND"
  | "API_UNAVAILABLE";

export type OrthomosaicLoadResult =
  | { status: "success"; viewModel: OrthomosaicViewModel }
  | { status: "empty"; reason: OrthomosaicLoadError };

function toLoadError(error: unknown): OrthomosaicLoadError {
  if (error instanceof ApiError) {
    if (error.status === 404) return "JOB_NOT_FOUND";
    return "API_UNAVAILABLE";
  }
  return "API_UNAVAILABLE";
}

export async function loadOrthomosaicViewModel(
  projectId: string,
  flightId?: string,
): Promise<OrthomosaicLoadResult> {
  const resolver = getOrthomosaicResolver();

  let resolution: OrthomosaicResolution | null;
  if (flightId) {
    resolution = await resolver.resolve(flightId, projectId);
  } else {
    resolution = await resolver.resolveLatestForProject(projectId);
  }

  if (!resolution) {
    debugLog("loadOrthomosaicViewModel: no resolution", { projectId, flightId });
    return { status: "empty", reason: "NO_RESOLUTION" };
  }

  try {
    const job = await getJob(resolution.jobId);
    const previewArtifactId = findPreviewArtifactId(
      job.artifacts,
      resolution.previewArtifactId,
    );

    if (!previewArtifactId) {
      return { status: "empty", reason: "NO_PREVIEW" };
    }

    const downloadArtifactId = findOrthomosaicDownloadArtifactId(job.artifacts);

    const [previewArtifact, orthomosaicArtifact, flight] = await Promise.all([
      getArtifact(previewArtifactId),
      downloadArtifactId
        ? getArtifact(downloadArtifactId).catch(() => null)
        : Promise.resolve(null),
      getFlight(resolution.flightId).catch(() => null),
    ]);

    const flightDate = flight ? parseDateOnly(flight.flightDate) : null;
    const surveyFields = mapOrthomosaicSurveyFields(
      orthomosaicArtifact?.metadata ?? {},
      flightDate,
    );

    return {
      status: "success",
      viewModel: {
        projectId,
        flightId: resolution.flightId,
        jobId: resolution.jobId,
        previewArtifactId,
        downloadArtifactId,
        previewUrl: artifactPreviewUrl(previewArtifactId),
        downloadUrl: downloadArtifactId
          ? artifactDownloadUrl(downloadArtifactId)
          : null,
        flightDate,
        operatorName: flight?.operatorName ?? null,
        jobStatus: jobStatusLabel(job.status),
        jobStatusVariant: jobStatusVariant(job.status),
        fileSizeBytes: previewArtifact.fileSize,
        fileSizeLabel: formatFileSize(previewArtifact.fileSize),
        processedAt: job.completedAt ? new Date(job.completedAt) : null,
        width: surveyFields.width ?? null,
        height: surveyFields.height ?? null,
        captureDateLabel: surveyFields.captureDateLabel,
        areaLabel: surveyFields.areaLabel,
        gsdLabel: surveyFields.gsdLabel,
        crs: surveyFields.crs,
        dimensionsLabel: surveyFields.dimensionsLabel,
        epsg: surveyFields.epsg,
        centerLat: surveyFields.centerLat,
        centerLon: surveyFields.centerLon,
        bounds: surveyFields.bounds,
      },
    };
  } catch (error) {
    debugLog("loadOrthomosaicViewModel: failed", {
      projectId,
      flightId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { status: "empty", reason: toLoadError(error) };
  }
}
