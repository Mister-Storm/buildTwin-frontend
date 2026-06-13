import type { ArtifactTypeDto } from "@/types/api/processing.api";

export const PREVIEW_ARTIFACT_TYPES: readonly ArtifactTypeDto[] = [
  "ORTHOMOSAIC_PREVIEW",
  "ORTHOMOSAIC_THUMBNAIL",
];

export function findPreviewArtifactId(
  artifacts: { artifactId: string; artifactType: ArtifactTypeDto }[],
  preferredId?: string,
): string | null {
  if (preferredId) {
    const exists = artifacts.some((a) => a.artifactId === preferredId);
    if (exists) return preferredId;
  }
  for (const type of PREVIEW_ARTIFACT_TYPES) {
    const match = artifacts.find((a) => a.artifactType === type);
    if (match) return match.artifactId;
  }
  return null;
}

export function findOrthomosaicDownloadArtifactId(
  artifacts: { artifactId: string; artifactType: ArtifactTypeDto }[],
): string | null {
  const match = artifacts.find((a) => a.artifactType === "ORTHOMOSAIC");
  return match?.artifactId ?? null;
}
