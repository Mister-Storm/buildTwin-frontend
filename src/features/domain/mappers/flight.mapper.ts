import type { FlightTimelineEntry } from "@/features/domain/models/flight";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";
import { jobStatusLabel, jobStatusVariant } from "@/lib/formatters";

export function toFlightTimelineEntry(
  dto: ProjectFlightListItemDto,
  hasOrthomosaic: boolean,
  isLatest: boolean,
): FlightTimelineEntry {
  return {
    id: dto.flightId,
    date: new Date(dto.flightDate),
    operatorName: dto.operatorName,
    statusLabel: jobStatusLabel(dto.latestProcessingStatus),
    statusVariant: jobStatusVariant(dto.latestProcessingStatus),
    imageCount: dto.imageCount,
    processingStatus: jobStatusLabel(dto.latestProcessingStatus),
    processingVariant: jobStatusVariant(dto.latestProcessingStatus),
    hasOrthomosaic,
    isLatest,
    latestJobId: dto.latestJobId,
  };
}

export function projectFlightsToTimeline(
  flights: ProjectFlightListItemDto[],
  orthomosaicFlightIds: ReadonlySet<string>,
): FlightTimelineEntry[] {
  const sorted = [...flights].sort(
    (a, b) => new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime(),
  );

  return sorted.map((flight, index) =>
    toFlightTimelineEntry(
      flight,
      orthomosaicFlightIds.has(flight.flightId),
      index === 0,
    ),
  );
}
