import { apiFetch } from "@/services/api-client";
import type { ProjectDashboardDto } from "@/types/api/dashboard.api";
import { DEMO_DASHBOARD_DTO } from "@/features/demo/demo-data";
import { DEMO_ENABLED, DEMO_PROJECT_ID } from "@/features/demo/demo-seed";

export async function getProjectDashboard(
  projectId: string,
): Promise<ProjectDashboardDto> {
  if (DEMO_ENABLED && projectId === DEMO_PROJECT_ID) {
    return DEMO_DASHBOARD_DTO;
  }
  try {
    return await apiFetch<ProjectDashboardDto>(
      `/projects/${projectId}/dashboard`,
    );
  } catch {
    if (DEMO_ENABLED && projectId === DEMO_PROJECT_ID) {
      return DEMO_DASHBOARD_DTO;
    }
    throw new Error("Dashboard indisponível.");
  }
}
