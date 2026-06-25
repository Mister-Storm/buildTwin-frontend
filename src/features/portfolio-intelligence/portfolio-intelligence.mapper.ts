import type { StatusVariant } from "@/features/domain/models/capture-session";
import type {
  ExecutiveAttentionLevel,
  InsightSeverity,
  PortfolioDistributionBucketDto,
  PortfolioInsightCardDto,
  PortfolioIntelligenceDto,
  ProjectPortfolioMetricsDto,
  ProjectRankingEntryDto,
} from "@/features/portfolio-intelligence/portfolio-intelligence.api";
import type { ForecastConfidence } from "@/features/forecast-intelligence/forecast-intelligence.api";
import { mapForecastConfidenceVariant } from "@/features/forecast-intelligence/forecast-intelligence.mapper";
import { mapHealthClassificationVariant } from "@/features/executive-intelligence/executive-intelligence.mapper";
import type { HealthClassification } from "@/features/executive-intelligence/executive-intelligence.api";

export type PortfolioOverviewCardViewModel = {
  label: string;
  value: string;
  subtitle?: string;
};

export type PortfolioInsightViewModel = {
  title: string;
  description: string;
  severity: InsightSeverity;
  severityLabel: string;
  severityVariant: StatusVariant;
};

export type ProjectRankingRowViewModel = {
  rank: number;
  projectId: string;
  projectName: string;
  metricLabel: string;
  href: string;
};

export type AttentionProjectViewModel = {
  projectId: string;
  projectName: string;
  executiveAttentionScoreLabel: string;
  executiveAttentionLevel: ExecutiveAttentionLevel;
  executiveAttentionLevelLabel: string;
  executiveAttentionLevelVariant: StatusVariant;
  constructionHealthScoreLabel: string;
  scheduleRiskLabel: string | null;
  href: string;
};

export type DistributionChartViewModel = {
  title: string;
  description: string;
  buckets: Array<{ label: string; count: number; barWidthPercent: number }>;
};

export type PortfolioIntelligenceViewModel = {
  overviewCards: PortfolioOverviewCardViewModel[];
  insights: PortfolioInsightViewModel[];
  topHealthyProjects: ProjectRankingRowViewModel[];
  attentionProjects: AttentionProjectViewModel[];
  wasteRanking: ProjectRankingRowViewModel[];
  riskSummary: {
    onTrack: number;
    attention: number;
    delayRisk: number;
    criticalDelay: number;
    withoutScheduleRisk: number;
  };
  trendSummary: {
    improving: number;
    stable: number;
    degrading: number;
    insufficientData: number;
  };
  healthDistribution: DistributionChartViewModel;
  scheduleRiskDistribution: DistributionChartViewModel;
  progressDistribution: DistributionChartViewModel;
  generatedAtLabel: string;
};

const ATTENTION_LEVEL_LABELS: Record<ExecutiveAttentionLevel, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const INSIGHT_SEVERITY_LABELS: Record<InsightSeverity, string> = {
  INFO: "Informação",
  WARNING: "Atenção",
  CRITICAL: "Crítico",
};

const CONFIDENCE_LABELS: Record<ForecastConfidence, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

const HEALTH_LABELS: Record<HealthClassification, string> = {
  EXCELLENT: "Excelente",
  GOOD: "Bom",
  WARNING: "Atenção",
  CRITICAL: "Crítico",
};

export function mapExecutiveAttentionLevelVariant(
  level: ExecutiveAttentionLevel,
): StatusVariant {
  switch (level) {
    case "LOW":
      return "success";
    case "MEDIUM":
      return "info";
    case "HIGH":
      return "warning";
    case "CRITICAL":
      return "error";
  }
}

export function mapInsightSeverityVariant(severity: InsightSeverity): StatusVariant {
  switch (severity) {
    case "INFO":
      return "info";
    case "WARNING":
      return "warning";
    case "CRITICAL":
      return "error";
  }
}

export function mapPortfolioIntelligenceViewModel(
  dto: PortfolioIntelligenceDto,
): PortfolioIntelligenceViewModel {
  const { overview, rankings, riskDistribution, trendSnapshot, distributions } = dto;

  return {
    overviewCards: [
      {
        label: "Obras ativas",
        value: String(overview.activeProjects),
        subtitle: `${overview.totalProjects} no total · ${overview.completedProjects} concluídas`,
      },
      {
        label: "Saúde média",
        value: formatOptionalPercent(overview.averageHealthScore),
        subtitle: "Índice de saúde da construção",
      },
      {
        label: "Eficiência média",
        value: formatOptionalPercent(overview.averageWasteScore),
        subtitle: "Score de eficiência de recursos",
      },
      {
        label: "Progresso médio",
        value: formatOptionalPercent(overview.averageProgressPercent),
        ...(overview.averageForecastConfidence
          ? {
              subtitle: `Confiança média: ${CONFIDENCE_LABELS[overview.averageForecastConfidence]}`,
            }
          : {}),
      },
    ],
    insights: dto.insights.map(mapInsight),
    topHealthyProjects: rankings.health.slice(0, 5).map(mapRankingRow),
    attentionProjects: dto.projectsRequiringAttention.map(mapAttentionProject),
    wasteRanking: rankings.waste.map(mapRankingRow),
    riskSummary: {
      onTrack: riskDistribution.projectsOnTrack,
      attention: riskDistribution.projectsAttention,
      delayRisk: riskDistribution.projectsDelayRisk,
      criticalDelay: riskDistribution.projectsCriticalDelay,
      withoutScheduleRisk: riskDistribution.projectsWithoutScheduleRisk,
    },
    trendSummary: {
      improving: trendSnapshot.improvingProjects,
      stable: trendSnapshot.stableProjects,
      degrading: trendSnapshot.degradingProjects,
      insufficientData: trendSnapshot.insufficientDataProjects,
    },
    healthDistribution: mapDistributionChart(
      "Distribuição de saúde",
      "Classificação de saúde da construção por obra ativa.",
      distributions.health,
    ),
    scheduleRiskDistribution: mapDistributionChart(
      "Distribuição de risco de cronograma",
      "Risco de cronograma previsto por obra ativa.",
      distributions.scheduleRisk,
    ),
    progressDistribution: mapDistributionChart(
      "Distribuição de progresso",
      "Percentual estimado de conclusão por obra ativa.",
      distributions.progress,
    ),
    generatedAtLabel: new Date(dto.generatedAt).toLocaleString("pt-BR"),
  };
}

function mapInsight(dto: PortfolioInsightCardDto): PortfolioInsightViewModel {
  return {
    title: dto.title,
    description: dto.description,
    severity: dto.severity,
    severityLabel: INSIGHT_SEVERITY_LABELS[dto.severity],
    severityVariant: mapInsightSeverityVariant(dto.severity),
  };
}

function mapRankingRow(entry: ProjectRankingEntryDto): ProjectRankingRowViewModel {
  return {
    rank: entry.rank,
    projectId: entry.projectId,
    projectName: entry.projectName,
    metricLabel: formatRankingMetric(entry),
    href: `/projects/${entry.projectId}`,
  };
}

function mapAttentionProject(dto: ProjectPortfolioMetricsDto): AttentionProjectViewModel {
  return {
    projectId: dto.projectId,
    projectName: dto.projectName,
    executiveAttentionScoreLabel: String(dto.executiveAttentionScore),
    executiveAttentionLevel: dto.executiveAttentionLevel,
    executiveAttentionLevelLabel: ATTENTION_LEVEL_LABELS[dto.executiveAttentionLevel],
    executiveAttentionLevelVariant: mapExecutiveAttentionLevelVariant(
      dto.executiveAttentionLevel,
    ),
    constructionHealthScoreLabel:
      dto.constructionHealthScore != null ? String(dto.constructionHealthScore) : "—",
    scheduleRiskLabel: dto.scheduleRisk ?? null,
    href: `/projects/${dto.projectId}`,
  };
}

function mapDistributionChart(
  title: string,
  description: string,
  buckets: PortfolioDistributionBucketDto[],
): DistributionChartViewModel {
  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);
  return {
    title,
    description,
    buckets: buckets.map((bucket) => ({
      label: bucket.label,
      count: bucket.count,
      barWidthPercent: (bucket.count / maxCount) * 100,
    })),
  };
}

function formatOptionalPercent(value: number | null): string {
  if (value == null) {
    return "—";
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}`;
}

function formatRankingMetric(entry: ProjectRankingEntryDto): string {
  if (entry.metricValue == null) {
    return entry.metricLabel ?? "—";
  }
  const value = entry.metricValue.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  if (entry.metricLabel) {
    if (HEALTH_LABELS[entry.metricLabel as HealthClassification]) {
      return `${value} · ${HEALTH_LABELS[entry.metricLabel as HealthClassification]}`;
    }
    return `${value} · ${entry.metricLabel}`;
  }
  return value;
}

export function mapHealthBadgeVariant(
  classification: HealthClassification | null,
): StatusVariant {
  if (!classification) {
    return "neutral";
  }
  return mapHealthClassificationVariant(classification);
}

export function mapConfidenceBadgeVariant(confidence: ForecastConfidence): StatusVariant {
  return mapForecastConfidenceVariant(confidence);
}
