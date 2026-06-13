import type { FlightTimelineEntry, ProjectDashboardView } from "@/features/domain/models/flight";
import type { ProjectDashboardDto } from "@/types/api/dashboard.api";
import { jobStatusLabel, jobStatusVariant } from "@/lib/formatters";

function dashboardFlightToTimelineEntry(
  dto: ProjectDashboardDto["recentFlights"][number],
  hasOrthomosaic: boolean,
  isLatest: boolean,
): FlightTimelineEntry {
  return {
    id: dto.flightId,
    date: new Date(dto.flightDate),
    operatorName: "—",
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

export function toProjectDashboardView(
  dto: ProjectDashboardDto,
  orthomosaicFlightIds: ReadonlySet<string>,
): ProjectDashboardView {
  const sortedRecent = [...dto.recentFlights].sort(
    (a, b) => new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime(),
  );

  return {
    projectId: dto.projectId,
    projectName: dto.projectName,
    archived: dto.archived,
    totalFlights: dto.totalFlights,
    flightsByStatus: dto.flightsByStatus,
    processedFlights: dto.processedFlights,
    pendingFlights: dto.pendingFlights,
    failedFlights: dto.failedFlights,
    latestFlightDate: dto.latestFlightDate
      ? new Date(dto.latestFlightDate)
      : null,
    recentFlights: sortedRecent.map((flight, index) =>
      dashboardFlightToTimelineEntry(
        flight,
        orthomosaicFlightIds.has(flight.flightId),
        index === 0,
      ),
    ),
  };
}
