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
  flightId: string,
  dto: RegisterMaterialInventoryRequestDto,
): Promise<RegisterMaterialInventoryResponseDto> {
  debugLog("registerMaterialInventory", { flightId, itemCount: dto.items.length });
  return apiFetch<RegisterMaterialInventoryResponseDto>(`/flights/${flightId}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function compareProjectMaterialInventory(
  projectId: string,
  flightA: string,
  flightB: string,
): Promise<ProjectMaterialInventoryCompareDto> {
  debugLog("compareProjectMaterialInventory", { projectId, flightA, flightB });
  return apiFetch<ProjectMaterialInventoryCompareDto>(
    `/projects/${projectId}/inventory/compare?flightA=${flightA}&flightB=${flightB}`,
  );
}

export async function detectMaterialInventory(
  flightId: string,
): Promise<DetectMaterialInventoryResponseDto> {
  debugLog("detectMaterialInventory", { flightId });
  return apiFetch(`/flights/${flightId}/inventory/detect`, {
    method: "POST",
  });
}
