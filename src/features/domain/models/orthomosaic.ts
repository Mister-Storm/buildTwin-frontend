import type { StatusVariant } from "@/features/domain/models/flight";

export type OrthomosaicViewModel = {
  projectId: string;
  flightId: string;
  jobId: string;
  previewArtifactId: string;
  downloadArtifactId: string | null;
  previewUrl: string;
  downloadUrl: string | null;
  flightDate: Date | null;
  operatorName: string | null;
  jobStatus: string;
  jobStatusVariant: StatusVariant;
  fileSizeBytes: number;
  fileSizeLabel: string;
  processedAt: Date | null;
  width: number | null;
  height: number | null;
};

export type OrthomosaicResolution = Readonly<{
  projectId: string;
  flightId: string;
  jobId: string;
  previewArtifactId?: string | undefined;
}>;
