import { apiFetch } from "@/services/api-client";
import type { PlanMissionResponse } from "@/features/drone-mission/drone-mission.api";

export type DroneMissionListItem = {
  id: string;
  projectId: string;
  name: string;
  status: "PLANNED" | "COMPLETED" | "CANCELLED";
  flightDate: string | null;
  areaSquareMeters: number | null;
  photoCount: number | null;
  createdAt: string;
};

export type DroneMissionDetail = {
  id: string;
  projectId: string;
  name: string;
  status: "PLANNED" | "COMPLETED" | "CANCELLED";
  flightDate: string | null;
  boundary: { lat: number; lon: number }[] | null;
  waypoints: PlanMissionResponse["waypoints"];
  stats: PlanMissionResponse["stats"];
  parameters: PlanMissionResponse["parameters"];
  camera: PlanMissionResponse["camera"];
  createdAt: string;
  updatedAt: string;
};

export type SaveMissionBody = {
  projectId: string;
  name: string;
  flightDate: string | null;
  boundary: { lat: number; lon: number }[];
  waypoints: PlanMissionResponse["waypoints"];
  stats: PlanMissionResponse["stats"];
  parameters: PlanMissionResponse["parameters"];
  camera: PlanMissionResponse["camera"];
};

export async function saveMission(body: SaveMissionBody): Promise<DroneMissionListItem> {
  return apiFetch<DroneMissionListItem>("/drone-mission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function listMissions(projectId: string): Promise<DroneMissionListItem[]> {
  return apiFetch<DroneMissionListItem[]>(`/drone-mission?projectId=${projectId}`);
}

export async function updateMissionStatus(
  id: string,
  status: "CANCELLED" | "COMPLETED",
): Promise<DroneMissionListItem> {
  return apiFetch<DroneMissionListItem>(`/drone-mission/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function getMissionById(id: string): Promise<DroneMissionDetail> {
  return apiFetch<DroneMissionDetail>(`/drone-mission/${id}`);
}
