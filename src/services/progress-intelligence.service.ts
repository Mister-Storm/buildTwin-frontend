import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { VisualProgressIntelligenceDto } from "@/types/api/visual-progress-intelligence.api";

export async function getVisualProgressIntelligence(
  projectId: string,
  captureSessionA: string,
  captureSessionB: string,
): Promise<VisualProgressIntelligenceDto> {
  debugLog("getVisualProgressIntelligence", { projectId, captureSessionA, captureSessionB });
  const params = new URLSearchParams({ captureSessionA, captureSessionB });
  return apiFetch<VisualProgressIntelligenceDto>(
    `/projects/${projectId}/progress?${params.toString()}`,
  );
}
