import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { VisualProgressIntelligenceDto } from "@/types/api/visual-progress-intelligence.api";

export async function getVisualProgressIntelligence(
  projectId: string,
  flightA: string,
  flightB: string,
): Promise<VisualProgressIntelligenceDto> {
  debugLog("getVisualProgressIntelligence", { projectId, flightA, flightB });
  const params = new URLSearchParams({ flightA, flightB });
  return apiFetch<VisualProgressIntelligenceDto>(
    `/projects/${projectId}/progress?${params.toString()}`,
  );
}
