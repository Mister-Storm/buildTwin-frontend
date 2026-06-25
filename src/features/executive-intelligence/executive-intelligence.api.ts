import type { MetricExplanationDto } from "@/types/api/explainability.api";
import type { ProjectBenchmarkIntelligenceDto } from "@/features/benchmark-intelligence/benchmark-intelligence.api";

export type HealthClassification =
  | "EXCELLENT"
  | "GOOD"
  | "WARNING"
  | "CRITICAL";

export type TrendDirection =
  | "IMPROVING"
  | "STABLE"
  | "DEGRADING"
  | "INSUFFICIENT_DATA";

export type ProductivityClassification = "HIGH" | "NORMAL" | "LOW";

export type HealthScoreBreakdownDto = {
  resourceEfficiencyScore: number;
  builtAreaProgressScore: number;
  verticalProgressScore: number;
  dataCompletenessScore: number;
};

export type ExecutiveConstructionIntelligenceDto = {
  projectId: string;
  constructionHealthScore: number;
  classification: HealthClassification;
  healthScoreBreakdown: HealthScoreBreakdownDto;
  productivityIndex: number | null;
  productivityClassification: ProductivityClassification | null;
  builtAreaVelocity: number | null;
  floorVelocity: number | null;
  wasteTrend: TrendDirection;
  benchmarks: ProjectBenchmarkIntelligenceDto | null;
  generatedAt: string;
  healthExplanation: MetricExplanationDto;
};
