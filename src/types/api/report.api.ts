export type ReportPurposeDto =
  | "TECHNICAL_PHOTOGRAMMETRY"
  | "FALLBACK_VISUAL_EVIDENCE";

export type ReportLimitationDto =
  | "NOT_EXECUTIVE_PROGRESS_ASSESSMENT"
  | "NO_CERTIFIED_METRIC_ACCURACY"
  | "NO_3D_RECONSTRUCTION"
  | "REDUCED_METRIC_ACCURACY"
  | "PROVENANCE_UNRECORDED";

export type ProgressReportResponseDto = {
  id: string;
  captureSessionId: string;
  reportPath: string;
  generatedAt: string;
  artifactId: string | null;
  purpose: ReportPurposeDto | null;
  processingProfile: string | null;
  measurementReliability: string | null;
  limitations: ReportLimitationDto[];
};
