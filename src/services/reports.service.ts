import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProgressReportResponseDto } from "@/types/api/report.api";

export async function getProgressReport(
  flightId: string,
): Promise<ProgressReportResponseDto> {
  debugLog("getProgressReport", { flightId });
  return apiFetch<ProgressReportResponseDto>(`/reports/${flightId}`);
}
