import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectWasteAnalysisDto } from "@/features/waste-intelligence/waste-intelligence.api";

export async function getProjectWasteAnalysis(
  projectId: string,
  captureSessionA: string,
  captureSessionB: string,
): Promise<ProjectWasteAnalysisDto> {
  debugLog("getProjectWasteAnalysis", { projectId, captureSessionA, captureSessionB });
  return apiFetch<ProjectWasteAnalysisDto>(
    `/projects/${projectId}/waste-analysis?captureSessionA=${captureSessionA}&captureSessionB=${captureSessionB}`,
  );
}
