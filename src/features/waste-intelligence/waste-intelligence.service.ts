import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectWasteAnalysisDto } from "@/features/waste-intelligence/waste-intelligence.api";

export async function getProjectWasteAnalysis(
  projectId: string,
  flightA: string,
  flightB: string,
): Promise<ProjectWasteAnalysisDto> {
  debugLog("getProjectWasteAnalysis", { projectId, flightA, flightB });
  return apiFetch<ProjectWasteAnalysisDto>(
    `/projects/${projectId}/waste-analysis?flightA=${flightA}&flightB=${flightB}`,
  );
}
