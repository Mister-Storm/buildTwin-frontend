import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectProgressDto } from "@/types/api/progress.api";

export async function getProjectProgress(
  projectId: string,
  flightA: string,
  flightB: string,
): Promise<ProjectProgressDto> {
  debugLog("getProjectProgress", { projectId, flightA, flightB });
  const params = new URLSearchParams({ flightA, flightB });
  return apiFetch<ProjectProgressDto>(
    `/projects/${projectId}/progress?${params.toString()}`,
  );
}
