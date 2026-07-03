import { apiFetch } from "@/services/api-client";
import type {
  PlanMissionRequest,
  PlanMissionResponse,
} from "@/features/drone-mission/drone-mission.api";

export async function planMission(
  projectId: string,
  request: PlanMissionRequest,
): Promise<PlanMissionResponse> {
  return apiFetch<PlanMissionResponse>(`/drone-mission/plan`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}
