export type JobStatusDto =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED_RESTRICTED";

export type RecoveryCauseDto =
  | "PROGRESS_UNVERIFIED"
  | "CONTACT_LOST"
  | "SUPERVISION_EXPIRED"
  | "EXECUTION_DEADLINE_EXCEEDED";

export type AttemptStateDto =
  | "ACTIVE"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED_RESTRICTED";

export type StageStatusDto =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED"
  | "UNKNOWN";

export type StageEvidenceDto = "RECORDED" | "NOT_RECORDED";

export type ProcessingAttemptSummaryDto = {
  attemptNumber: number;
  state: AttemptStateDto;
  startedAt: string;
  completedAt: string | null;
};

export type ProcessingStageSummaryDto = {
  stage: string;
  outputPurpose: string;
  required: boolean;
  status: StageStatusDto;
  failureCode: string | null;
  retryable: boolean | null;
  processingProfile: string | null;
  sourceImageCount: number | null;
  reconstructedImageCount: number | null;
};

export type ProcessingJobRecoveryFieldsDto = {
  recoverable?: boolean | null;
  recoveryCause?: RecoveryCauseDto | null;
  attempt?: ProcessingAttemptSummaryDto | null;
  stages?: ProcessingStageSummaryDto[];
  stageEvidence?: StageEvidenceDto;
};

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
  captureSessionId: string;
  jobType: JobTypeDto;
  status: JobStatusDto;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  artifacts: ProcessingArtifactResponseDto[];
} & ProcessingJobRecoveryFieldsDto;

export type ProcessingArtifactDetailResponseDto = {
  artifactId: string;
  artifactType: ArtifactTypeDto;
  storagePath: string;
  fileSize: number;
  checksum: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type LatestCaptureSessionJobResponseDto = {
  jobId: string;
  captureSessionId: string;
  jobType: JobTypeDto;
  status: JobStatusDto;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
} & ProcessingJobRecoveryFieldsDto;

export type StartProcessingJobResponseDto = {
  jobId: string;
  captureSessionId: string;
  jobType: JobTypeDto;
  status: JobStatusDto;
  createdAt: string;
};
