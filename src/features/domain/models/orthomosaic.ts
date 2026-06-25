import type { StatusVariant } from "@/features/domain/models/capture-session";

export type OrthomosaicBounds = {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};

export type OrthomosaicViewModel = {
  projectId: string;
  captureSessionId: string;
  jobId: string;
  previewArtifactId: string;
  downloadArtifactId: string | null;
  previewUrl: string;
  downloadUrl: string | null;
  captureDate: Date | null;
  operatorName: string | null;
  jobStatus: string;
  jobStatusVariant: StatusVariant;
  fileSizeBytes: number;
  fileSizeLabel: string;
  processedAt: Date | null;
  width: number | null;
  height: number | null;
  captureDateLabel: string | null;
  areaLabel: string | null;
  gsdLabel: string | null;
  crs: string | null;
  dimensionsLabel: string | null;
  epsg: number | null;
  centerLat: number | null;
  centerLon: number | null;
  bounds: OrthomosaicBounds | null;
};

export type OrthomosaicResolution = Readonly<{
  projectId: string;
  captureSessionId: string;
  jobId: string;
  previewArtifactId?: string | undefined;
}>;
