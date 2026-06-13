import { apiFetch } from "@/services/api-client";
import type { ProcessingJobDetailResponseDto } from "@/types/api/processing.api";

export async function getJob(
  jobId: string,
): Promise<ProcessingJobDetailResponseDto> {
  return apiFetch<ProcessingJobDetailResponseDto>(`/jobs/${jobId}`);
}
