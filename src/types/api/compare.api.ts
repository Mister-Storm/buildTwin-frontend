export type ChangeLevelDto =
  | "VERY_LOW"
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "VERY_HIGH";

export type ComparisonQualityDto = "NORMAL" | "LOW";

export type CompareFlightMetricsDto = {
  areaSquareMeters: number | null;
  gsdCmPerPixel: number | null;
};

export type CompareMetricsDto = {
  flightA: CompareFlightMetricsDto;
  flightB: CompareFlightMetricsDto;
};

export type ProjectCompareDto = {
  flightA: string;
  flightB: string;
  changePercentage: number;
  changedPixels: number;
  totalPixels: number;
  changeLevel: ChangeLevelDto;
  comparisonQuality: ComparisonQualityDto;
  heatmapArtifactId: string;
  metrics: CompareMetricsDto;
};
