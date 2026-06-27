import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  HeatmapsDto,
  SpatialIntelligenceDto,
} from "@/features/spatial-intelligence/spatial-intelligence.api";

export async function getProjectSpatialIntelligence(
  projectId: string,
): Promise<SpatialIntelligenceDto> {
  debugLog("getProjectSpatialIntelligence", { projectId });
  return apiFetch<SpatialIntelligenceDto>(`/projects/${projectId}/spatial`);
}

export async function getProjectHeatmaps(projectId: string): Promise<HeatmapsDto> {
  debugLog("getProjectHeatmaps", { projectId });
  return apiFetch<HeatmapsDto>(`/projects/${projectId}/heatmaps`);
}
