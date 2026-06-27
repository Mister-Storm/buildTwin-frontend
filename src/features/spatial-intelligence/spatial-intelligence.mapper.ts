import type { StatusVariant } from "@/features/domain/models/capture-session";
import { mapMetricExplanation } from "@/features/explainability/explainability.mapper";
import type { MetricExplanationViewModel } from "@/features/explainability/explainability.mapper";
import type {
  SpatialHotspotDto,
  SpatialHotspotSeverity,
  SpatialIntelligenceDto,
  SpatialMetric,
} from "@/features/spatial-intelligence/spatial-intelligence.api";

export type SpatialHotspotViewModel = {
  regionLabel: string;
  metricLabel: string;
  severityLabel: string;
  severityVariant: StatusVariant;
  summary: string;
  valueLabel: string;
};

export type SpatialSummaryViewModel = {
  dominantRegionLabel: string | null;
  gridLabel: string;
  coverageLabel: string | null;
  topHotspots: SpatialHotspotViewModel[];
};

export type HeatmapViewModel = {
  metric: SpatialMetric;
  metricLabel: string;
  rows: number;
  cols: number;
  values: number[][];
};

export type SpatialIntelligenceViewModel = {
  generatedAtLabel: string;
  summary: SpatialSummaryViewModel | null;
  hotspots: SpatialHotspotViewModel[];
  heatmaps: HeatmapViewModel[];
  spatialExplanation: MetricExplanationViewModel | null;
};

const METRIC_LABELS: Record<SpatialMetric, string> = {
  WASTE: "Resíduos",
  BUILT_AREA: "Área construída",
  PRODUCTIVITY: "Produtividade",
  PROGRESS: "Progresso",
  VERTICAL_PROGRESS: "Vertical",
  COVERAGE: "Cobertura",
  INVENTORY_DENSITY: "Inventário",
  DETECTION_COUNT: "Detecções",
};

const SEVERITY_LABELS: Record<SpatialHotspotSeverity, string> = {
  CRITICAL: "Crítico",
  HIGH: "Alto",
  MEDIUM: "Médio",
  LOW: "Baixo",
};

const REGION_LABELS: Record<string, string> = {
  NORTH: "Norte",
  SOUTH: "Sul",
  EAST: "Leste",
  WEST: "Oeste",
  CENTRAL: "Central",
  NORTHEAST: "Nordeste",
  NORTHWEST: "Noroeste",
  SOUTHEAST: "Sudeste",
  SOUTHWEST: "Sudoeste",
};

export function mapSpatialHotspotSeverityVariant(
  severity: SpatialHotspotSeverity,
): StatusVariant {
  switch (severity) {
    case "CRITICAL":
      return "error";
    case "HIGH":
      return "warning";
    case "MEDIUM":
      return "info";
    case "LOW":
      return "success";
  }
}

function mapHotspot(hotspot: SpatialHotspotDto): SpatialHotspotViewModel {
  return {
    regionLabel: REGION_LABELS[hotspot.region] ?? hotspot.region,
    metricLabel: METRIC_LABELS[hotspot.metric] ?? hotspot.metric,
    severityLabel: SEVERITY_LABELS[hotspot.severity],
    severityVariant: mapSpatialHotspotSeverityVariant(hotspot.severity),
    summary: hotspot.summary,
    valueLabel: hotspot.value.toFixed(1),
  };
}

export function mapSpatialIntelligenceViewModel(
  dto: SpatialIntelligenceDto,
): SpatialIntelligenceViewModel {
  const summary = dto.summary
    ? {
        dominantRegionLabel: dto.summary.dominantRegion
          ? (REGION_LABELS[dto.summary.dominantRegion] ?? dto.summary.dominantRegion)
          : null,
        gridLabel: `${dto.summary.gridRows}×${dto.summary.gridCols}`,
        coverageLabel: dto.summary.coverage
          ? `${dto.summary.coverage.gridCoveragePercent.toFixed(1)}% da grade`
          : null,
        topHotspots: dto.summary.topHotspots.map(mapHotspot),
      }
    : null;

  return {
    generatedAtLabel: new Date(dto.generatedAt).toLocaleString("pt-BR"),
    summary,
    hotspots: dto.hotspots.map(mapHotspot),
    heatmaps: dto.heatmaps.map((heatmap) => ({
      metric: heatmap.metric,
      metricLabel: METRIC_LABELS[heatmap.metric] ?? heatmap.metric,
      rows: heatmap.rows,
      cols: heatmap.cols,
      values: heatmap.values,
    })),
    spatialExplanation: dto.spatialExplanation
      ? mapMetricExplanation(dto.spatialExplanation)
      : null,
  };
}
