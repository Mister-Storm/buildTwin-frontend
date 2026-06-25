import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  BuiltAreaSnapshotResponseDto,
  DetectBuiltAreaResponseDto,
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
  captureSessionId: string,
  dto: RegisterBuiltAreaSnapshotRequestDto,
): Promise<BuiltAreaSnapshotResponseDto> {
  debugLog("registerBuiltArea", { captureSessionId, area: dto.observedBuiltAreaSquareMeters });
  return apiFetch<BuiltAreaSnapshotResponseDto>(`/capture-sessions/${captureSessionId}/built-area`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function detectBuiltArea(
  captureSessionId: string,
): Promise<DetectBuiltAreaResponseDto> {
  debugLog("detectBuiltArea", { captureSessionId });
  return apiFetch<DetectBuiltAreaResponseDto>(`/capture-sessions/${captureSessionId}/built-area/detect`, {
    method: "POST",
  });
}
