import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProcessingJobDetailResponseDto } from "@/types/api/processing.api";

export async function getJob(
  jobId: string,
): Promise<ProcessingJobDetailResponseDto> {
  debugLog("getJob", { jobId });
  return apiFetch<ProcessingJobDetailResponseDto>(`/jobs/${jobId}`);
}
