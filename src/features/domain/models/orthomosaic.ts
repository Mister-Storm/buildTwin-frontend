import type { StatusVariant } from "@/features/domain/models/flight";

export type OrthomosaicViewModel = {
  projectId: string;
  flightId: string;
  jobId: string;
  previewArtifactId: string;
  previewUrl: string;
  flightDate: Date | null;
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
