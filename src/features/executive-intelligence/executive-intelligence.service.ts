import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { ExecutiveConstructionIntelligenceDto } from "@/features/executive-intelligence/executive-intelligence.api";

export async function getExecutiveConstructionIntelligence(
  projectId: string,
): Promise<ExecutiveConstructionIntelligenceDto> {
  debugLog("getExecutiveConstructionIntelligence", { projectId });
  return apiFetch<ExecutiveConstructionIntelligenceDto>(
    `/projects/${projectId}/executive-intelligence`,
  );
}
