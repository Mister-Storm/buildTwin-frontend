import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  BuiltAreaSnapshotResponseDto,
  ProjectBuiltAreaSnapshotsDto,
  RegisterBuiltAreaSnapshotRequestDto,
} from "@/types/api/built-area.api";

export async function getProjectBuiltArea(
  projectId: string,
): Promise<ProjectBuiltAreaSnapshotsDto> {
  debugLog("getProjectBuiltArea", { projectId });
  return apiFetch<ProjectBuiltAreaSnapshotsDto>(`/projects/${projectId}/built-area`);
}

export async function registerBuiltArea(
  flightId: string,
  dto: RegisterBuiltAreaSnapshotRequestDto,
): Promise<BuiltAreaSnapshotResponseDto> {
  debugLog("registerBuiltArea", { flightId, area: dto.observedBuiltAreaSquareMeters });
  return apiFetch<BuiltAreaSnapshotResponseDto>(`/flights/${flightId}/built-area`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}
