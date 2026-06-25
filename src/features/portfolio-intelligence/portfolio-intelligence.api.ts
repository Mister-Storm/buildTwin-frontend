import type { HealthClassification } from "@/features/executive-intelligence/executive-intelligence.api";
import type { TrendDirection } from "@/features/executive-intelligence/executive-intelligence.api";
import type { ProductivityClassification } from "@/features/executive-intelligence/executive-intelligence.api";
import type { PortfolioBenchmarkSummaryDto } from "@/features/benchmark-intelligence/benchmark-intelligence.api";
import type { ForecastConfidence } from "@/features/forecast-intelligence/forecast-intelligence.api";
import type { ScheduleRisk } from "@/features/forecast-intelligence/forecast-intelligence.api";
import type {
  MetricExplanationDto,
  PortfolioExplanationDto,
} from "@/types/api/explainability.api";

export type ExecutiveAttentionLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type InsightSeverity = "INFO" | "WARNING" | "CRITICAL";

export type PortfolioOverviewDto = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageHealthScore: number | null;
  averageForecastConfidence: ForecastConfidence | null;
  averageWasteScore: number | null;
  averageProgressPercent: number | null;
  generatedAt: string;
};

export type PortfolioBenchmarksDto = {
  averageHealthScore: number | null;
  averageWasteScore: number | null;
  averageProgressPercent: number | null;
};

export type ProjectRankingEntryDto = {
  rank: number;
  projectId: string;
  projectName: string;
  metricValue: number | null;
  metricLabel: string | null;
};

export type PortfolioRankingsDto = {
  health: ProjectRankingEntryDto[];
  delayRisk: ProjectRankingEntryDto[];
  waste: ProjectRankingEntryDto[];
  productivity: ProjectRankingEntryDto[];
};

export type PortfolioRiskDistributionDto = {
  projectsOnTrack: number;
  projectsAttention: number;
  projectsDelayRisk: number;
  projectsCriticalDelay: number;
  projectsWithoutScheduleRisk: number;
};

export type PortfolioTrendSnapshotDto = {
  improvingProjects: number;
  stableProjects: number;
  degradingProjects: number;
  insufficientDataProjects: number;
};

export type PortfolioDistributionBucketDto = {
  label: string;
  count: number;
};

export type PortfolioDistributionsDto = {
  health: PortfolioDistributionBucketDto[];
  scheduleRisk: PortfolioDistributionBucketDto[];
  progress: PortfolioDistributionBucketDto[];
};

export type ProjectPortfolioMetricsDto = {
  projectId: string;
  projectName: string;
  constructionHealthScore: number | null;
  healthClassification: HealthClassification | null;
  resourceEfficiencyScore: number | null;
  productivityIndex: number | null;
  productivityClassification: ProductivityClassification | null;
  builtAreaVelocity: number | null;
  wasteTrend: TrendDirection;
  scheduleRisk: ScheduleRisk | null;
  forecastConfidence: ForecastConfidence;
  estimatedCompletionPercent: number | null;
  executiveAttentionScore: number;
  executiveAttentionLevel: ExecutiveAttentionLevel;
  attentionExplanation: MetricExplanationDto | null;
};

export type PortfolioInsightCardDto = {
  title: string;
  description: string;
  severity: InsightSeverity;
};

export type PortfolioIntelligenceDto = {
  overview: PortfolioOverviewDto;
  benchmarks: PortfolioBenchmarksDto;
  benchmarkSummary: PortfolioBenchmarkSummaryDto;
  rankings: PortfolioRankingsDto;
  riskDistribution: PortfolioRiskDistributionDto;
  trendSnapshot: PortfolioTrendSnapshotDto;
  distributions: PortfolioDistributionsDto;
  projectsRequiringAttention: ProjectPortfolioMetricsDto[];
  insights: PortfolioInsightCardDto[];
  generatedAt: string;
  portfolioExplanation: PortfolioExplanationDto;
};
