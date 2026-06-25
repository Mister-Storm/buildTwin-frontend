import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { StartProcessingJobResponseDto } from "@/types/api/processing.api";

export async function startProcessing(
  captureSessionId: string,
): Promise<StartProcessingJobResponseDto> {
  debugLog("startProcessing", { captureSessionId });
  return apiFetch<StartProcessingJobResponseDto>(
    `/capture-sessions/${captureSessionId}/process`,
    { method: "POST" },
  );
}
