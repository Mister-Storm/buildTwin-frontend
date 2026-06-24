export type JobStatusDto = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type JobTypeDto = "ORTHOMOSAIC_PROCESSING";

export type ArtifactTypeDto =
  | "ORTHOMOSAIC"
  | "ORTHOMOSAIC_PREVIEW"
  | "ORTHOMOSAIC_THUMBNAIL"
  | "CHANGE_HEATMAP"
  | "MATERIAL_DETECTION_PREVIEW"
  | "POINT_CLOUD"
  | "MESH"
  | "MODEL_3D"
  | "REPORT";

export type ArtifactStatusDto =
  | "GENERATED"
  | "VALIDATED"
  | "PUBLISHED"
  | "ARCHIVED";

export type ProcessingArtifactResponseDto = {
  artifactId: string;
  artifactType: ArtifactTypeDto;
  artifactStatus: ArtifactStatusDto;
  storagePath: string;
  fileSize: number;
  checksum: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ProcessingJobDetailResponseDto = {
  jobId: string;
  flightId: string;
  jobType: JobTypeDto;
  status: JobStatusDto;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  artifacts: ProcessingArtifactResponseDto[];
};

export type ProcessingArtifactDetailResponseDto = {
  artifactId: string;
  artifactType: ArtifactTypeDto;
  storagePath: string;
  fileSize: number;
  checksum: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type LatestFlightJobResponseDto = {
  jobId: string;
  flightId: string;
  jobType: JobTypeDto;
  status: JobStatusDto;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
};

export type StartProcessingJobResponseDto = {
  jobId: string;
  flightId: string;
  jobType: JobTypeDto;
  status: JobStatusDto;
  createdAt: string;
};
