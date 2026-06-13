import { apiFetch } from "@/services/api-client";
import type { FlightResponseDto } from "@/types/api/flight.api";
import { DEMO_FLIGHTS_DTO } from "@/features/demo/demo-data";
import { DEMO_ENABLED, DEMO_PROJECT_ID } from "@/features/demo/demo-seed";

export async function listFlightsByProject(
  projectId: string,
): Promise<FlightResponseDto[]> {
  if (DEMO_ENABLED && projectId === DEMO_PROJECT_ID) {
    return [...DEMO_FLIGHTS_DTO];
  }
  try {
    return await apiFetch<FlightResponseDto[]>(
      `/projects/${projectId}/flights`,
    );
  } catch {
    if (DEMO_ENABLED && projectId === DEMO_PROJECT_ID) {
      return [...DEMO_FLIGHTS_DTO];
    }
    throw new Error("Voos indisponíveis.");
  }
}

export async function getFlight(id: string): Promise<FlightResponseDto> {
  if (DEMO_ENABLED) {
    const demo = DEMO_FLIGHTS_DTO.find((f) => f.id === id);
    if (demo) return demo;
  }
  return apiFetch<FlightResponseDto>(`/flights/${id}`);
}
