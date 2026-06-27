import type { MetricExplanationDto } from "@/types/api/explainability.api";

export type SpatialHotspotSeverity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type SpatialMetric =
  | "WASTE"
  | "BUILT_AREA"
  | "PRODUCTIVITY"
  | "VERTICAL_PROGRESS"
  | "INVENTORY_DENSITY"
  | "DETECTION_COUNT"
  | "COVERAGE"
  | "PROGRESS";

export type SpatialHeatmapDto = {
  metric: SpatialMetric;
  rows: number;
  cols: number;
  values: number[][];
};

export type SpatialHotspotDto = {
  region: string;
  metric: SpatialMetric;
  severity: SpatialHotspotSeverity;
  summary: string;
  cellRow: number;
  cellCol: number;
  value: number;
};

export type SpatialCoverageDto = {
  surveyedAreaSquareMeters: number;
  gridCoveragePercent: number;
  detectionCoveragePercent: number;
};

export type SpatialSummaryDto = {
  dominantRegion: string | null;
  topHotspots: SpatialHotspotDto[];
  coverage: SpatialCoverageDto | null;
  gridRows: number;
  gridCols: number;
};

export type SpatialIntelligenceDto = {
  projectId: string;
  captureSessionId: string | null;
  gridMetadata: {
    rows: number;
    cols: number;
    cellSizeMeters: number;
    boundingBox: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    };
  } | null;
  heatmaps: SpatialHeatmapDto[];
  hotspots: SpatialHotspotDto[];
  regions: Array<{
    id: string;
    label: string;
    metrics: Record<string, number>;
  }>;
  coverage: SpatialCoverageDto | null;
  summary: SpatialSummaryDto | null;
  spatialExplanation: MetricExplanationDto | null;
  generatedAt: string;
};

export type HeatmapsDto = {
  projectId: string;
  heatmaps: SpatialHeatmapDto[];
};
