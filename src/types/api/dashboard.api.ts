export type DashboardFlightSummaryDto = {
  id: string;
  flightDate: string;
  status: string;
  imageCount: number;
  latestJobStatus: string | null;
  hasReport: boolean;
};

export type ProjectDashboardDto = {
  projectId: string;
  projectName: string;
  archived: boolean;
  totalFlights: number;
  flightsByStatus: Record<string, number>;
  recentFlights: DashboardFlightSummaryDto[];
};
