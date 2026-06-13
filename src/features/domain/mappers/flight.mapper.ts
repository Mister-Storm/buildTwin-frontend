import type { FlightTimelineEntry } from "@/features/domain/models/flight";
import type { DashboardFlightSummaryDto } from "@/types/api/dashboard.api";
import type { FlightResponseDto } from "@/types/api/flight.api";
import {
  flightStatusLabel,
  flightStatusVariant,
  jobStatusLabel,
  jobStatusVariant,
} from "@/lib/formatters";

function mapFlightBase(
  id: string,
  flightDate: string,
  operatorName: string,
  status: string,
  imageCount: number,
  latestJobStatus: string | null,
  hasOrthomosaic: boolean,
  isLatest: boolean,
): FlightTimelineEntry {
  return {
    id,
    date: new Date(flightDate),
    operatorName,
    statusLabel: flightStatusLabel(status),
    statusVariant: flightStatusVariant(status),
    imageCount,
    processingStatus: jobStatusLabel(latestJobStatus),
    processingVariant: jobStatusVariant(latestJobStatus),
    hasOrthomosaic,
    isLatest,
  };
}

export function toFlightTimelineEntry(
  dto: FlightResponseDto,
  latestJobStatus: string | null,
  hasOrthomosaic: boolean,
  isLatest: boolean,
): FlightTimelineEntry {
  return mapFlightBase(
    dto.id,
    dto.flightDate,
    dto.operatorName,
    dto.status,
    dto.imageCount,
    latestJobStatus,
    hasOrthomosaic,
    isLatest,
  );
}

export function dashboardFlightToTimelineEntry(
  dto: DashboardFlightSummaryDto,
  hasOrthomosaic: boolean,
  isLatest: boolean,
): FlightTimelineEntry {
  return mapFlightBase(
    dto.id,
    dto.flightDate,
    "—",
    dto.status,
    dto.imageCount,
    dto.latestJobStatus,
    hasOrthomosaic,
    isLatest,
  );
}

export function mergeFlightsWithDashboard(
  flights: FlightResponseDto[],
  dashboardFlights: DashboardFlightSummaryDto[],
  orthomosaicFlightIds: ReadonlySet<string>,
): FlightTimelineEntry[] {
  const jobStatusByFlight = new Map(
    dashboardFlights.map((f) => [f.id, f.latestJobStatus]),
  );

  const sorted = [...flights].sort(
    (a, b) => new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime(),
  );

  return sorted.map((flight, index) =>
    toFlightTimelineEntry(
      flight,
      jobStatusByFlight.get(flight.id) ?? null,
      orthomosaicFlightIds.has(flight.id),
      index === 0,
    ),
  );
}
