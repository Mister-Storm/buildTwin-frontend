import type { StatusVariant } from "@/features/domain/models/capture-session";
import { mapProjectBenchmarkIntelligence } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import type { ProjectBenchmarkIntelligenceViewModel } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import { mapMetricExplanation } from "@/features/explainability/explainability.mapper";
import type { MetricExplanationViewModel } from "@/features/explainability/explainability.mapper";
import type {
  ExecutiveConstructionIntelligenceDto,
  HealthClassification,
  HealthScoreBreakdownDto,
  ProductivityClassification,
  TrendDirection,
} from "@/features/executive-intelligence/executive-intelligence.api";

export type HealthScoreBreakdownViewModel = {
  resourceEfficiencyScoreLabel: string;
  builtAreaProgressScoreLabel: string;
  verticalProgressScoreLabel: string;
  dataCompletenessScoreLabel: string;
};

export type ExecutiveIntelligenceViewModel = {
  constructionHealthScoreLabel: string;
  healthClassification: HealthClassification;
  healthClassificationLabel: string;
  healthClassificationVariant: StatusVariant;
  healthScoreBreakdown: HealthScoreBreakdownViewModel;
  productivityIndexLabel: string;
  productivityClassification: ProductivityClassification | null;
  productivityClassificationLabel: string | null;
  productivityClassificationVariant: StatusVariant | null;
  productivityTooltip: string;
  builtAreaVelocityLabel: string;
  floorVelocityLabel: string;
  wasteTrend: TrendDirection;
  wasteTrendLabel: string;
  generatedAtLabel: string;
  healthExplanation: MetricExplanationViewModel;
  benchmarks: ProjectBenchmarkIntelligenceViewModel;
};

const HEALTH_CLASSIFICATION_LABELS: Record<HealthClassification, string> = {
  EXCELLENT: "Excelente",
  GOOD: "Bom",
  WARNING: "Atenção",
  CRITICAL: "Crítico",
};

const PRODUCTIVITY_CLASSIFICATION_LABELS: Record<ProductivityClassification, string> = {
  HIGH: "Alta",
  NORMAL: "Normal",
  LOW: "Baixa",
};

const WASTE_TREND_LABELS: Record<TrendDirection, string> = {
  IMPROVING: "Melhorando",
  STABLE: "Estável",
  DEGRADING: "Piorando",
  INSUFFICIENT_DATA: "Dados insuficientes",
};

export function mapHealthClassificationVariant(
  classification: HealthClassification,
): StatusVariant {
  switch (classification) {
    case "EXCELLENT":
      return "success";
    case "GOOD":
      return "info";
    case "WARNING":
      return "warning";
    case "CRITICAL":
      return "error";
  }
}

export function mapProductivityClassificationVariant(
  classification: ProductivityClassification,
): StatusVariant {
  switch (classification) {
    case "HIGH":
      return "success";
    case "NORMAL":
      return "info";
    case "LOW":
      return "warning";
  }
}

export function mapHealthScoreBreakdown(
  breakdown: HealthScoreBreakdownDto,
): HealthScoreBreakdownViewModel {
  return {
    resourceEfficiencyScoreLabel: String(breakdown.resourceEfficiencyScore),
    builtAreaProgressScoreLabel: String(breakdown.builtAreaProgressScore),
    verticalProgressScoreLabel: String(breakdown.verticalProgressScore),
    dataCompletenessScoreLabel: String(breakdown.dataCompletenessScore),
  };
}

export function mapExecutiveIntelligenceViewModel(
  dto: ExecutiveConstructionIntelligenceDto,
): ExecutiveIntelligenceViewModel {
  return {
    constructionHealthScoreLabel: String(dto.constructionHealthScore),
    healthClassification: dto.classification,
    healthClassificationLabel: HEALTH_CLASSIFICATION_LABELS[dto.classification],
    healthClassificationVariant: mapHealthClassificationVariant(dto.classification),
    healthScoreBreakdown: mapHealthScoreBreakdown(dto.healthScoreBreakdown),
    productivityIndexLabel: formatProductivityIndex(dto.productivityIndex),
    productivityClassification: dto.productivityClassification,
    productivityClassificationLabel: dto.productivityClassification
      ? PRODUCTIVITY_CLASSIFICATION_LABELS[dto.productivityClassification]
      : null,
    productivityClassificationVariant: dto.productivityClassification
      ? mapProductivityClassificationVariant(dto.productivityClassification)
      : null,
    productivityTooltip:
      "Indicador de produtividade material (unidades consumidas por m² produzido). Não é recomendação nem benchmark de desempenho.",
    builtAreaVelocityLabel: formatVelocity(dto.builtAreaVelocity, "m²/dia"),
    floorVelocityLabel: formatVelocity(dto.floorVelocity, "pav./dia"),
    wasteTrend: dto.wasteTrend,
    wasteTrendLabel: WASTE_TREND_LABELS[dto.wasteTrend],
    generatedAtLabel: formatGeneratedAt(dto.generatedAt),
    healthExplanation: mapMetricExplanation(dto.healthExplanation),
    benchmarks: mapProjectBenchmarkIntelligence(dto.benchmarks),
  };
}

function formatProductivityIndex(value: number | null): string {
  if (value == null) {
    return "—";
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} un/m²`;
}

function formatVelocity(value: number | null, unit: string): string {
  if (value == null) {
    return "Dados insuficientes";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unit}`;
}

function formatGeneratedAt(value: string): string {
  return new Date(value).toLocaleString("pt-BR");
}
