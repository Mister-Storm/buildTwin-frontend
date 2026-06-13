export type JobStatusDto = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type ProjectFlightListItemDto = {
  flightId: string;
  flightDate: string;
  operatorName: string;
  imageCount: number;
  latestProcessingStatus: JobStatusDto | null;
  latestJobId: string | null;
};

export type FlightLatestJobSummaryDto = {
  jobId: string;
  status: JobStatusDto;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type FlightDetailsResponseDto = {
  flightId: string;
  projectId: string;
  flightDate: string;
  operatorName: string;
  imageCount: number;
  createdAt: string | null;
  latestJob: FlightLatestJobSummaryDto | null;
};
