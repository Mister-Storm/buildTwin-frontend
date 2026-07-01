import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import { DEMO_WASTE_ANALYSIS_DTO } from "@/features/demo/demo-data";
import { DEMO_ENABLED, isDemoProject } from "@/features/demo/demo-seed";
import type { ProjectWasteAnalysisDto } from "@/features/waste-intelligence/waste-intelligence.api";

export async function getProjectWasteAnalysis(
  projectId: string,
  captureSessionA: string,
  captureSessionB: string,
): Promise<ProjectWasteAnalysisDto> {
  debugLog("getProjectWasteAnalysis", { projectId, captureSessionA, captureSessionB });

  if (DEMO_ENABLED && isDemoProject(projectId)) {
    return Promise.resolve({
      ...DEMO_WASTE_ANALYSIS_DTO,
      captureSessionAId: captureSessionA,
      captureSessionBId: captureSessionB,
    });
  }

  return apiFetch<ProjectWasteAnalysisDto>(
    `/projects/${projectId}/waste-analysis?captureSessionA=${captureSessionA}&captureSessionB=${captureSessionB}`,
  );
}
