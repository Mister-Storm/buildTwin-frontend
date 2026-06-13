import type { OrthomosaicViewModel } from "@/features/domain/models/orthomosaic";
import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";
import {
  buildDemoOrthomosaicViewModel,
  canUseDemoOrthomosaic,
} from "@/features/demo/demo-orthomosaic";
import { getOrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import {
  formatFileSize,
  jobStatusLabel,
  jobStatusVariant,
} from "@/lib/formatters";
import { artifactPreviewUrl } from "@/services/api-client";
import { getArtifact } from "@/services/artifacts.service";
import { getFlight } from "@/services/flights.service";
import { getJob } from "@/services/jobs.service";
import type { ArtifactTypeDto } from "@/types/api/processing.api";

const PREVIEW_TYPES: readonly ArtifactTypeDto[] = [
  "ORTHOMOSAIC_PREVIEW",
  "ORTHOMOSAIC_THUMBNAIL",
];

function findPreviewArtifactId(
  artifacts: { artifactId: string; artifactType: ArtifactTypeDto }[],
  preferredId?: string,
): string | null {
  if (preferredId) {
    const exists = artifacts.some((a) => a.artifactId === preferredId);
    if (exists) return preferredId;
  }
  for (const type of PREVIEW_TYPES) {
    const match = artifacts.find((a) => a.artifactType === type);
    if (match) return match.artifactId;
  }
  return null;
}

function readMetadataNumber(
  metadata: Record<string, unknown>,
  key: string,
): number | null {
  const value = metadata[key];
  return typeof value === "number" ? value : null;
}

export async function loadOrthomosaicViewModel(
  projectId: string,
  flightId?: string,
): Promise<OrthomosaicViewModel | null> {
  const resolver = getOrthomosaicResolver();

  let resolution: OrthomosaicResolution | null;
  if (flightId) {
    resolution = await resolver.resolve(flightId, projectId);
  } else {
    resolution = await resolver.resolveLatestForProject(projectId);
  }

  if (!resolution) return null;

  if (canUseDemoOrthomosaic(projectId, resolution.flightId)) {
    return buildDemoOrthomosaicViewModel(projectId, resolution.flightId);
  }

  try {
    const job = await getJob(resolution.jobId);
    const previewArtifactId = findPreviewArtifactId(
      job.artifacts,
      resolution.previewArtifactId,
    );

    if (!previewArtifactId) return null;

    const [artifact, flight] = await Promise.all([
      getArtifact(previewArtifactId),
      getFlight(resolution.flightId).catch(() => null),
    ]);

    return {
      projectId,
      flightId: resolution.flightId,
      jobId: resolution.jobId,
      previewArtifactId,
      previewUrl: artifactPreviewUrl(previewArtifactId),
      flightDate: flight ? new Date(flight.flightDate) : null,
      jobStatus: jobStatusLabel(job.status),
      jobStatusVariant: jobStatusVariant(job.status),
      fileSizeBytes: artifact.fileSize,
      fileSizeLabel: formatFileSize(artifact.fileSize),
      processedAt: job.completedAt ? new Date(job.completedAt) : null,
      width: readMetadataNumber(artifact.metadata, "width"),
      height: readMetadataNumber(artifact.metadata, "height"),
    };
  } catch {
    if (canUseDemoOrthomosaic(projectId, resolution.flightId)) {
      return buildDemoOrthomosaicViewModel(projectId, resolution.flightId);
    }
    return null;
  }
}
