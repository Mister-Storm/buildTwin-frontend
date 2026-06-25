import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { DetectVerticalConstructionResponseDto } from "@/types/api/vertical-construction.api";

export async function detectVerticalConstruction(
  flightId: string,
): Promise<DetectVerticalConstructionResponseDto> {
  debugLog("detectVerticalConstruction", { flightId });
  return apiFetch<DetectVerticalConstructionResponseDto>(
    `/flights/${flightId}/vertical-construction/detect`,
    {
      method: "POST",
    },
  );
}
