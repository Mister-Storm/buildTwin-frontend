import type { ProjectDashboardView } from "@/features/domain/models/flight";
import { dashboardFlightToTimelineEntry } from "@/features/domain/mappers/flight.mapper";
import type { ProjectDashboardDto } from "@/types/api/dashboard.api";

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
    recentFlights: sortedRecent.map((flight, index) =>
      dashboardFlightToTimelineEntry(
        flight,
        orthomosaicFlightIds.has(flight.id),
        index === 0,
      ),
    ),
  };
}
