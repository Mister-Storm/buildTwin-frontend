import { apiFetch } from "@/services/api-client";
import type { ProcessingArtifactDetailResponseDto } from "@/types/api/processing.api";

export async function getArtifact(
  artifactId: string,
): Promise<ProcessingArtifactDetailResponseDto> {
  return apiFetch<ProcessingArtifactDetailResponseDto>(
    `/artifacts/${artifactId}`,
  );
}
