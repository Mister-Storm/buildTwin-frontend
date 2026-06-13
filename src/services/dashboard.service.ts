import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectDashboardDto } from "@/types/api/dashboard.api";

export async function getProjectDashboard(
  projectId: string,
): Promise<ProjectDashboardDto> {
  debugLog("getProjectDashboard", { projectId });
  return apiFetch<ProjectDashboardDto>(`/projects/${projectId}/dashboard`);
}
