import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProgressReportResponseDto } from "@/types/api/report.api";

export async function getProgressReport(
  captureSessionId: string,
): Promise<ProgressReportResponseDto> {
  debugLog("getProgressReport", { captureSessionId });
  return apiFetch<ProgressReportResponseDto>(`/reports/${captureSessionId}`);
}
