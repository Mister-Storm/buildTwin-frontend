import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { StartProcessingJobResponseDto } from "@/types/api/processing.api";

export async function startProcessing(
  flightId: string,
): Promise<StartProcessingJobResponseDto> {
  debugLog("startProcessing", { flightId });
  return apiFetch<StartProcessingJobResponseDto>(
    `/flights/${flightId}/process`,
    { method: "POST" },
  );
}
