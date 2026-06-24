import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectMaterialConsumptionDto } from "@/features/material-consumption/material-consumption.api";

export async function getProjectMaterialConsumption(
  projectId: string,
  flightA: string,
  flightB: string,
): Promise<ProjectMaterialConsumptionDto> {
  debugLog("getProjectMaterialConsumption", { projectId, flightA, flightB });
  return apiFetch<ProjectMaterialConsumptionDto>(
    `/projects/${projectId}/inventory/consumption?flightA=${flightA}&flightB=${flightB}`,
  );
}
