import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  FlightDetailsResponseDto,
  ProjectFlightListItemDto,
} from "@/types/api/flight.api";
import type { LatestFlightJobResponseDto } from "@/types/api/processing.api";

export async function listFlightsByProject(
  projectId: string,
): Promise<ProjectFlightListItemDto[]> {
  debugLog("listFlightsByProject", { projectId });
  return apiFetch<ProjectFlightListItemDto[]>(
    `/projects/${projectId}/flights`,
  );
}

export async function getFlight(
  flightId: string,
): Promise<FlightDetailsResponseDto> {
  debugLog("getFlight", { flightId });
  return apiFetch<FlightDetailsResponseDto>(`/flights/${flightId}`);
}

export async function getLatestFlightJob(
  flightId: string,
): Promise<LatestFlightJobResponseDto> {
  debugLog("getLatestFlightJob", { flightId });
  return apiFetch<LatestFlightJobResponseDto>(
    `/flights/${flightId}/latest-job`,
  );
}
