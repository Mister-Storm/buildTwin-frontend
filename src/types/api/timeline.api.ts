export type TimelineMetricsDto = {
  areaSquareMeters: number | null;
  gsdCmPerPixel: number | null;
};

export type ProjectTimelineItemDto = {
  sequenceNumber: number;
  flightId: string;
  flightDate: string;
  operatorName: string;
  jobId: string;
  jobStatus: string;
  orthomosaicArtifactId: string;
  orthomosaicPreviewArtifactId: string;
  processingCompletedAt: string;
  metrics: TimelineMetricsDto | null;
};

export type ProjectTimelineResponseDto = {
  projectId: string;
  timeline: ProjectTimelineItemDto[];
};
