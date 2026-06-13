export type JobStatusDto = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type FlightStatusDto =
  | "CREATED"
  | "UPLOADING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

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

export type CreateFlightRequestDto = {
  flightDate: string;
  operatorName: string;
};

export type CreateFlightResponseDto = {
  id: string;
  projectId: string;
  flightDate: string;
  operatorName: string;
  status: FlightStatusDto;
  imageCount: number;
};

export type FlightImageMetadataDto = {
  capturedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
};

export type FlightImageResponseDto = {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  checksum: string;
  storagePath: string;
  uploadedAt: string;
  metadata: FlightImageMetadataDto | null;
};

export type UploadFlightImageResponseDto = {
  imageId: string;
  fileName: string;
  storagePath: string;
};
