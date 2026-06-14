import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectTimelineResponseDto } from "@/types/api/timeline.api";

export async function getProjectTimeline(
  projectId: string,
): Promise<ProjectTimelineResponseDto> {
  debugLog("getProjectTimeline", { projectId });
  return apiFetch<ProjectTimelineResponseDto>(`/projects/${projectId}/timeline`);
}
