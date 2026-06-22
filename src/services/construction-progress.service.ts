import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  ProjectConstructionProgressDto,
  ProjectConstructionProgressTimelineDto,
  ProjectProgressHistoryDto,
} from "@/types/api/construction-progress.api";

export async function getConstructionProjectProgress(
  projectId: string,
): Promise<ProjectConstructionProgressDto> {
  debugLog("getConstructionProjectProgress", { projectId });
  return apiFetch<ProjectConstructionProgressDto>(`/projects/${projectId}/progress`);
}

export async function getConstructionProjectProgressHistory(
  projectId: string,
): Promise<ProjectProgressHistoryDto> {
  debugLog("getConstructionProjectProgressHistory", { projectId });
  return apiFetch<ProjectProgressHistoryDto>(`/projects/${projectId}/progress/history`);
}

export async function getConstructionProgressTimeline(
  projectId: string,
): Promise<ProjectConstructionProgressTimelineDto> {
  debugLog("construction_progress_loaded", { projectId });
  return apiFetch<ProjectConstructionProgressTimelineDto>(
    `/projects/${projectId}/progress/timeline`,
  );
}
