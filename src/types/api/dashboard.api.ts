import type { JobStatusDto } from "@/types/api/flight.api";

export type DashboardFlightSummaryDto = {
  flightId: string;
  flightDate: string;
  imageCount: number;
  latestProcessingStatus: JobStatusDto | null;
  latestJobId: string | null;
  hasReport: boolean;
};

export type ProjectDashboardDto = {
  projectId: string;
  projectName: string;
  archived: boolean;
  totalFlights: number;
  flightsByStatus: Record<string, number>;
  processedFlights: number;
  pendingFlights: number;
  failedFlights: number;
  latestFlightDate: string | null;
  recentFlights: DashboardFlightSummaryDto[];
};
