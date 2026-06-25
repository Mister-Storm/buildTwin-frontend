import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ProjectCompareDto } from "@/types/api/compare.api";

export async function getProjectCompare(
  projectId: string,
  captureSessionA: string,
  captureSessionB: string,
): Promise<ProjectCompareDto> {
  debugLog("getProjectCompare", { projectId, captureSessionA, captureSessionB });
  const params = new URLSearchParams({ captureSessionA, captureSessionB });
  return apiFetch<ProjectCompareDto>(
    `/projects/${projectId}/compare?${params.toString()}`,
  );
}
