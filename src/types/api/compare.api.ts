export type ChangeLevelDto =
  | "VERY_LOW"
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "VERY_HIGH";

export type ComparisonQualityDto = "NORMAL" | "LOW";

export type CompareCaptureSessionMetricsDto = {
  areaSquareMeters: number | null;
  gsdCmPerPixel: number | null;
};

export type CompareMetricsDto = {
  captureSessionA: CompareCaptureSessionMetricsDto;
  captureSessionB: CompareCaptureSessionMetricsDto;
};

export type ProjectCompareDto = {
  captureSessionA: string;
  captureSessionB: string;
  changePercentage: number;
  changedPixels: number;
  totalPixels: number;
  changeLevel: ChangeLevelDto;
  comparisonQuality: ComparisonQualityDto;
  heatmapArtifactId: string;
  metrics: CompareMetricsDto;
};
