import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProcessingArtifactDetailResponseDto } from "@/types/api/processing.api";

export async function getArtifact(
  artifactId: string,
): Promise<ProcessingArtifactDetailResponseDto> {
  debugLog("getArtifact", { artifactId });
  return apiFetch<ProcessingArtifactDetailResponseDto>(
    `/artifacts/${artifactId}`,
  );
}
