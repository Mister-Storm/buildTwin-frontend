import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectCompareDto } from "@/types/api/compare.api";

export async function getProjectCompare(
  projectId: string,
  flightA: string,
  flightB: string,
): Promise<ProjectCompareDto> {
  debugLog("getProjectCompare", { projectId, flightA, flightB });
  const params = new URLSearchParams({ flightA, flightB });
  return apiFetch<ProjectCompareDto>(
    `/projects/${projectId}/compare?${params.toString()}`,
  );
}
