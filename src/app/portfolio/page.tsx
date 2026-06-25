import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/shared/States";
import { PortfolioIntelligenceDashboard } from "@/features/portfolio-intelligence/PortfolioIntelligenceDashboard";
import { loadPortfolioIntelligenceViewModel } from "@/features/portfolio-intelligence/load-portfolio-intelligence-view-model";

export default async function PortfolioPage() {
  const result = await loadPortfolioIntelligenceViewModel();

  return (
    <AppShell breadcrumbs={[{ label: "Portfólio" }]}>
      <div className="space-y-8">
        <PageHeader
          title="Inteligência do Portfólio"
          description="Visão agregada de todas as obras ativas — saúde, risco, progresso e atenção executiva."
        />

        {result.status === "error" ? (
          <ErrorState title="Não foi possível carregar" message={result.message} />
        ) : (
          <PortfolioIntelligenceDashboard viewModel={result.viewModel} />
        )}
      </div>
    </AppShell>
  );
}
