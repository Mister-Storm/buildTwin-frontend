export type JobStatusDto = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type CaptureSessionStatusDto =
  | "CREATED"
  | "UPLOADING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type ProjectCaptureSessionListItemDto = {
  captureSessionId: string;
  captureDate: string;
  operatorName: string;
  imageCount: number;
  latestProcessingStatus: JobStatusDto | null;
  latestJobId: string | null;
};

export type CaptureSessionLatestJobSummaryDto = {
  jobId: string;
  status: JobStatusDto;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type CaptureSessionDetailsResponseDto = {
  captureSessionId: string;
  projectId: string;
  captureDate: string;
  operatorName: string;
  imageCount: number;
  createdAt: string | null;
  latestJob: CaptureSessionLatestJobSummaryDto | null;
};

export type CreateCaptureSessionRequestDto = {
  captureDate: string;
  operatorName: string;
};

export type CreateCaptureSessionResponseDto = {
  id: string;
  projectId: string;
  captureDate: string;
  operatorName: string;
  status: CaptureSessionStatusDto;
  imageCount: number;
};

export type CaptureImageMetadataDto = {
  capturedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
};

export type CaptureImageResponseDto = {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  checksum: string;
  storagePath: string;
  uploadedAt: string;
  metadata: CaptureImageMetadataDto | null;
};

export type UploadCaptureImageResponseDto = {
  imageId: string;
  fileName: string;
  storagePath: string;
};
