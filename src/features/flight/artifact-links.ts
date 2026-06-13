import type { ProcessingArtifactResponseDto } from "@/types/api/processing.api";
import type { ArtifactTypeDto } from "@/types/api/processing.api";
import {
  artifactDownloadUrl,
  artifactPreviewUrl,
} from "@/services/api-client";

export type FlightArtifactsByType = Partial<
  Record<ArtifactTypeDto, ProcessingArtifactResponseDto>
>;

export function indexArtifactsByType(
  artifacts: ProcessingArtifactResponseDto[],
): FlightArtifactsByType {
  const map: FlightArtifactsByType = {};
  for (const artifact of artifacts) {
    map[artifact.artifactType] = artifact;
  }
  return map;
}

export function getArtifactDownloadLink(
  artifacts: FlightArtifactsByType,
  type: ArtifactTypeDto,
): string | null {
  const id = artifacts[type]?.artifactId;
  return id ? artifactDownloadUrl(id) : null;
}

export function getArtifactPreviewLink(
  artifacts: FlightArtifactsByType,
  type: ArtifactTypeDto,
): string | null {
  const id = artifacts[type]?.artifactId;
  if (!id) return null;
  if (
    type === "ORTHOMOSAIC_PREVIEW" ||
    type === "ORTHOMOSAIC_THUMBNAIL"
  ) {
    return artifactPreviewUrl(id);
  }
  return null;
}
