import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  DetectMaterialInventoryResponseDto,
  ProjectMaterialInventoryCompareDto,
  ProjectMaterialInventoryDto,
  RegisterMaterialInventoryRequestDto,
  RegisterMaterialInventoryResponseDto,
} from "@/types/api/material-inventory.api";

export async function getProjectMaterialInventory(
  projectId: string,
): Promise<ProjectMaterialInventoryDto> {
  debugLog("getProjectMaterialInventory", { projectId });
  return apiFetch<ProjectMaterialInventoryDto>(`/projects/${projectId}/inventory`);
}

export async function registerMaterialInventory(
  captureSessionId: string,
  dto: RegisterMaterialInventoryRequestDto,
): Promise<RegisterMaterialInventoryResponseDto> {
  debugLog("registerMaterialInventory", { captureSessionId, itemCount: dto.items.length });
  return apiFetch<RegisterMaterialInventoryResponseDto>(`/capture-sessions/${captureSessionId}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function compareProjectMaterialInventory(
  projectId: string,
  captureSessionA: string,
  captureSessionB: string,
): Promise<ProjectMaterialInventoryCompareDto> {
  debugLog("compareProjectMaterialInventory", { projectId, captureSessionA, captureSessionB });
  return apiFetch<ProjectMaterialInventoryCompareDto>(
    `/projects/${projectId}/inventory/compare?captureSessionA=${captureSessionA}&captureSessionB=${captureSessionB}`,
  );
}

export async function detectMaterialInventory(
  captureSessionId: string,
): Promise<DetectMaterialInventoryResponseDto> {
  debugLog("detectMaterialInventory", { captureSessionId });
  return apiFetch(`/capture-sessions/${captureSessionId}/inventory/detect`, {
    method: "POST",
  });
}
