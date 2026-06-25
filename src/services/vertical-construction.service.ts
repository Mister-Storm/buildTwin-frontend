import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { DetectVerticalConstructionResponseDto } from "@/types/api/vertical-construction.api";

export async function detectVerticalConstruction(
  captureSessionId: string,
): Promise<DetectVerticalConstructionResponseDto> {
  debugLog("detectVerticalConstruction", { captureSessionId });
  return apiFetch<DetectVerticalConstructionResponseDto>(
    `/capture-sessions/${captureSessionId}/vertical-construction/detect`,
    {
      method: "POST",
    },
  );
}
