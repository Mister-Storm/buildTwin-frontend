import { BenchmarkSummaryCard } from "@/features/benchmark-intelligence/BenchmarkSummaryCard";
import { PortfolioExplanationSection } from "@/features/portfolio-intelligence/PortfolioExplanationSection";
import { PortfolioHealthDistributionChart } from "@/features/portfolio-intelligence/PortfolioHealthDistributionChart";
import { PortfolioProgressDistributionChart } from "@/features/portfolio-intelligence/PortfolioHealthDistributionChart";
import { PortfolioRiskDistributionChart } from "@/features/portfolio-intelligence/PortfolioHealthDistributionChart";
import { ExecutiveAttentionSection } from "@/features/portfolio-intelligence/ExecutiveAttentionSection";
import { PortfolioInsightsSection } from "@/features/portfolio-intelligence/PortfolioInsightsSection";
import { PortfolioCopilotSection } from "@/features/copilot-chat/PortfolioCopilotSection";
import { PortfolioOverviewCards } from "@/features/portfolio-intelligence/PortfolioOverviewCards";
import { PortfolioRiskDistributionSection } from "@/features/portfolio-intelligence/PortfolioRiskDistributionSection";
import type { PortfolioIntelligenceViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";
import { TopHealthyProjectsSection } from "@/features/portfolio-intelligence/TopHealthyProjectsSection";
import { WasteRankingTable } from "@/features/portfolio-intelligence/WasteRankingTable";

type PortfolioIntelligenceDashboardProps = {
  viewModel: PortfolioIntelligenceViewModel;
};

export function PortfolioIntelligenceDashboard({
  viewModel,
}: PortfolioIntelligenceDashboardProps) {
  return (
    <div className="space-y-8">
      <PortfolioOverviewCards cards={viewModel.overviewCards} />
      <BenchmarkSummaryCard viewModel={viewModel.benchmarkSummary} />
      <PortfolioExplanationSection explanation={viewModel.portfolioExplanation} />
      <PortfolioInsightsSection insights={viewModel.insights} />
      <PortfolioCopilotSection />
      <div className="grid gap-6 lg:grid-cols-2">
        <TopHealthyProjectsSection projects={viewModel.topHealthyProjects} />
        <ExecutiveAttentionSection projects={viewModel.attentionProjects} />
      </div>
      <PortfolioRiskDistributionSection
        riskSummary={viewModel.riskSummary}
        trendSummary={viewModel.trendSummary}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <PortfolioHealthDistributionChart viewModel={viewModel.healthDistribution} />
        <PortfolioRiskDistributionChart viewModel={viewModel.scheduleRiskDistribution} />
        <PortfolioProgressDistributionChart viewModel={viewModel.progressDistribution} />
      </div>
      <WasteRankingTable rows={viewModel.wasteRanking} />
      <p className="text-xs text-muted-foreground">
        Atualizado em {viewModel.generatedAtLabel}. Agregação determinística — não são
        recomendações nem previsões com machine learning.
      </p>
    </div>
  );
}
