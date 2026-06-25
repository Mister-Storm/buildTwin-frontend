import type { ProcessingArtifactResponseDto } from "@/types/api/processing.api";
import type { ArtifactTypeDto } from "@/types/api/processing.api";
import {
  artifactDownloadUrl,
  artifactPreviewUrl,
} from "@/services/api-client";

export type CaptureSessionArtifactsByType = Partial<
  Record<ArtifactTypeDto, ProcessingArtifactResponseDto>
>;

export function indexArtifactsByType(
  artifacts: ProcessingArtifactResponseDto[],
): CaptureSessionArtifactsByType {
  const map: CaptureSessionArtifactsByType = {};
  for (const artifact of artifacts) {
    map[artifact.artifactType] = artifact;
  }
  return map;
}

export function getArtifactDownloadLink(
  artifacts: CaptureSessionArtifactsByType,
  type: ArtifactTypeDto,
): string | null {
  const id = artifacts[type]?.artifactId;
  return id ? artifactDownloadUrl(id) : null;
}

export function getArtifactPreviewLink(
  artifacts: CaptureSessionArtifactsByType,
  type: ArtifactTypeDto,
): string | null {
  const id = artifacts[type]?.artifactId;
  if (!id) return null;
  if (
    type === "ORTHOMOSAIC_PREVIEW" ||
    type === "ORTHOMOSAIC_THUMBNAIL" ||
    type === "CHANGE_HEATMAP" ||
    type === "MATERIAL_DETECTION_PREVIEW"
  ) {
    return artifactPreviewUrl(id);
  }
  return null;
}
