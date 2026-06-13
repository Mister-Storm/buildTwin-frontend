import { apiFetch, apiUpload, type UploadProgressCallback } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  CreateFlightRequestDto,
  CreateFlightResponseDto,
  FlightDetailsResponseDto,
  FlightImageResponseDto,
  ProjectFlightListItemDto,
  UploadFlightImageResponseDto,
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

export async function createFlight(
  projectId: string,
  dto: CreateFlightRequestDto,
): Promise<CreateFlightResponseDto> {
  debugLog("createFlight", { projectId });
  return apiFetch<CreateFlightResponseDto>(`/projects/${projectId}/flights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function listFlightImages(
  flightId: string,
): Promise<FlightImageResponseDto[]> {
  debugLog("listFlightImages", { flightId });
  return apiFetch<FlightImageResponseDto[]>(`/flights/${flightId}/images`);
}

export async function uploadFlightImages(
  flightId: string,
  files: File[],
  onProgress?: UploadProgressCallback,
): Promise<UploadFlightImageResponseDto[]> {
  debugLog("uploadFlightImages", { flightId, count: files.length });
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  return apiUpload<UploadFlightImageResponseDto[]>(
    `/flights/${flightId}/images`,
    formData,
    onProgress,
  );
}
