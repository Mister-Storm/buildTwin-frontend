import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectMaterialConsumptionDto } from "@/features/material-consumption/material-consumption.api";

export async function getProjectMaterialConsumption(
  projectId: string,
  captureSessionA: string,
  captureSessionB: string,
): Promise<ProjectMaterialConsumptionDto> {
  debugLog("getProjectMaterialConsumption", { projectId, captureSessionA, captureSessionB });
  return apiFetch<ProjectMaterialConsumptionDto>(
    `/projects/${projectId}/inventory/consumption?captureSessionA=${captureSessionA}&captureSessionB=${captureSessionB}`,
  );
}
