import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortfolioIntelligenceDashboard } from "@/features/portfolio-intelligence/PortfolioIntelligenceDashboard";
import type { PortfolioIntelligenceViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";

const viewModel: PortfolioIntelligenceViewModel = {
  overviewCards: [
    { label: "Obras ativas", value: "1" },
    { label: "Saúde média", value: "80" },
    { label: "Eficiência média", value: "75" },
    { label: "Progresso médio", value: "50" },
  ],
  insights: [],
  topHealthyProjects: [],
  attentionProjects: [],
  wasteRanking: [],
  riskSummary: {
    onTrack: 1,
    attention: 0,
    delayRisk: 0,
    criticalDelay: 0,
    withoutScheduleRisk: 0,
  },
  trendSummary: {
    improving: 0,
    stable: 1,
    degrading: 0,
    insufficientData: 0,
  },
  healthDistribution: {
    title: "Distribuição de saúde",
    description: "Test",
    buckets: [{ label: "GOOD", count: 1, barWidthPercent: 100 }],
  },
  scheduleRiskDistribution: {
    title: "Distribuição de risco de cronograma",
    description: "Test",
    buckets: [{ label: "ON_TRACK", count: 1, barWidthPercent: 100 }],
  },
  progressDistribution: {
    title: "Distribuição de progresso",
    description: "Test",
    buckets: [{ label: "50-75%", count: 1, barWidthPercent: 100 }],
  },
  generatedAtLabel: "15/06/2026",
};

describe("PortfolioIntelligenceDashboard", () => {
  it("composes portfolio sections", () => {
    render(<PortfolioIntelligenceDashboard viewModel={viewModel} />);

    expect(screen.getByText("Obras ativas")).toBeInTheDocument();
    expect(screen.getByText("Ranking de eficiência de recursos")).toBeInTheDocument();
    expect(screen.getByText("Distribuição de saúde")).toBeInTheDocument();
  });
});
