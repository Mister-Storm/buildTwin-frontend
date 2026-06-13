import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectResponseDto } from "@/types/api/project.api";

export async function listProjects(
  includeArchived = false,
): Promise<ProjectResponseDto[]> {
  debugLog("listProjects", { includeArchived });
  return apiFetch<ProjectResponseDto[]>(
    `/projects${includeArchived ? "?includeArchived=true" : ""}`,
  );
}

export async function getProject(id: string): Promise<ProjectResponseDto> {
  debugLog("getProject", { id });
  return apiFetch<ProjectResponseDto>(`/projects/${id}`);
}
