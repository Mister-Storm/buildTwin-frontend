import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ConstructionForecastDto } from "@/features/forecast-intelligence/forecast-intelligence.api";

export async function getConstructionForecast(
  projectId: string,
): Promise<ConstructionForecastDto> {
  debugLog("getConstructionForecast", { projectId });
  return apiFetch<ConstructionForecastDto>(`/projects/${projectId}/forecast`);
}
