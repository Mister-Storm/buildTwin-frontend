import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  CreateProjectRequestDto,
  ProjectResponseDto,
  UpdateProjectRequestDto,
} from "@/types/api/project.api";

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

export async function createProject(
  dto: CreateProjectRequestDto,
): Promise<ProjectResponseDto> {
  debugLog("createProject", { name: dto.name });
  return apiFetch<ProjectResponseDto>("/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function updateProject(
  id: string,
  dto: UpdateProjectRequestDto,
): Promise<ProjectResponseDto> {
  debugLog("updateProject", { id });
  return apiFetch<ProjectResponseDto>(`/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function archiveProject(id: string): Promise<void> {
  debugLog("archiveProject", { id });
  await apiFetch<void>(`/projects/${id}`, { method: "DELETE" });
}
