import { describe, expect, it } from "vitest";
import {
  mapExecutiveAttentionLevelVariant,
  mapInsightSeverityVariant,
  mapPortfolioIntelligenceViewModel,
} from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";
import type { PortfolioIntelligenceDto } from "@/features/portfolio-intelligence/portfolio-intelligence.api";

const fullDto: PortfolioIntelligenceDto = {
  overview: {
    totalProjects: 3,
    activeProjects: 2,
    completedProjects: 1,
    averageHealthScore: 72.5,
    averageForecastConfidence: "MEDIUM",
    averageWasteScore: 81.0,
    averageProgressPercent: 48.2,
    generatedAt: "2026-06-15T12:00:00Z",
  },
  benchmarks: {
    averageHealthScore: 72.5,
    averageWasteScore: 81.0,
    averageProgressPercent: 48.2,
  },
  rankings: {
    health: [
      {
        rank: 1,
        projectId: "p1",
        projectName: "Alpha",
        metricValue: 90,
        metricLabel: "GOOD",
      },
    ],
    delayRisk: [],
    waste: [
      {
        rank: 1,
        projectId: "p1",
        projectName: "Alpha",
        metricValue: 85,
        metricLabel: null,
      },
    ],
    productivity: [],
  },
  riskDistribution: {
    projectsOnTrack: 1,
    projectsAttention: 0,
    projectsDelayRisk: 1,
    projectsCriticalDelay: 0,
    projectsWithoutScheduleRisk: 0,
  },
  trendSnapshot: {
    improvingProjects: 1,
    stableProjects: 1,
    degradingProjects: 0,
    insufficientDataProjects: 0,
  },
  distributions: {
    health: [{ label: "GOOD", count: 2 }],
    scheduleRisk: [{ label: "ON_TRACK", count: 1 }],
    progress: [{ label: "50-75%", count: 1 }],
  },
  projectsRequiringAttention: [
    {
      projectId: "p2",
      projectName: "Beta",
      constructionHealthScore: 42,
      healthClassification: "WARNING",
      resourceEfficiencyScore: 55,
      productivityIndex: 0.08,
      productivityClassification: "LOW",
      builtAreaVelocity: 3.2,
      wasteTrend: "DEGRADING",
      scheduleRisk: "DELAY_RISK",
      forecastConfidence: "LOW",
      estimatedCompletionPercent: 35.0,
      executiveAttentionScore: 87,
      executiveAttentionLevel: "CRITICAL",
    },
  ],
  insights: [
    {
      title: "Projetos com atraso crítico",
      description: "1 projeto com risco CRITICAL_DELAY no cronograma.",
      severity: "CRITICAL",
    },
  ],
  generatedAt: "2026-06-15T12:00:00Z",
};

describe("portfolio-intelligence.mapper", () => {
  it("maps attention and insight severity variants", () => {
    expect(mapExecutiveAttentionLevelVariant("CRITICAL")).toBe("error");
    expect(mapExecutiveAttentionLevelVariant("LOW")).toBe("success");
    expect(mapInsightSeverityVariant("WARNING")).toBe("warning");
    expect(mapInsightSeverityVariant("INFO")).toBe("info");
  });

  it("maps portfolio intelligence view model", () => {
    const viewModel = mapPortfolioIntelligenceViewModel(fullDto);

    expect(viewModel.overviewCards).toHaveLength(4);
    expect(viewModel.overviewCards[0]?.value).toBe("2");
    expect(viewModel.insights[0]?.severityLabel).toBe("Crítico");
    expect(viewModel.topHealthyProjects[0]?.projectName).toBe("Alpha");
    expect(viewModel.attentionProjects[0]?.executiveAttentionScoreLabel).toBe("87");
    expect(viewModel.attentionProjects[0]?.executiveAttentionLevelLabel).toBe("Crítica");
    expect(viewModel.wasteRanking[0]?.href).toBe("/projects/p1");
  });
});
