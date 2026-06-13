import { apiFetch } from "@/services/api-client";
import type { ProjectResponseDto } from "@/types/api/project.api";
import { DEMO_PROJECTS_DTO } from "@/features/demo/demo-data";
import { DEMO_ENABLED } from "@/features/demo/demo-seed";

export async function listProjects(
  includeArchived = false,
): Promise<ProjectResponseDto[]> {
  try {
    const projects = await apiFetch<ProjectResponseDto[]>(
      `/projects${includeArchived ? "?includeArchived=true" : ""}`,
    );
    if (projects.length === 0 && DEMO_ENABLED) {
      return [...DEMO_PROJECTS_DTO];
    }
    return projects;
  } catch {
    if (DEMO_ENABLED) return [...DEMO_PROJECTS_DTO];
    throw new Error("Não foi possível carregar as obras.");
  }
}

export async function getProject(id: string): Promise<ProjectResponseDto> {
  if (DEMO_ENABLED) {
    const demo = DEMO_PROJECTS_DTO.find((p) => p.id === id);
    if (demo) return demo;
  }
  try {
    return await apiFetch<ProjectResponseDto>(`/projects/${id}`);
  } catch {
    const demo = DEMO_PROJECTS_DTO.find((p) => p.id === id);
    if (demo) return demo;
    throw new Error("Obra não encontrada.");
  }
}
