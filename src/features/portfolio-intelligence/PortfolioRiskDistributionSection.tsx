import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PortfolioIntelligenceViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";

type PortfolioRiskDistributionSectionProps = {
  riskSummary: PortfolioIntelligenceViewModel["riskSummary"];
  trendSummary: PortfolioIntelligenceViewModel["trendSummary"];
};

export function PortfolioRiskDistributionSection({
  riskSummary,
  trendSummary,
}: PortfolioRiskDistributionSectionProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Risco e tendências</CardTitle>
        <CardDescription>
          Distribuição de risco de cronograma e tendência de desperdício no portfólio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium">Risco de cronograma</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">No prazo</dt>
                <dd className="font-medium">{riskSummary.onTrack}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Atenção</dt>
                <dd className="font-medium">{riskSummary.attention}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Risco de atraso</dt>
                <dd className="font-medium">{riskSummary.delayRisk}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Atraso crítico</dt>
                <dd className="font-medium">{riskSummary.criticalDelay}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sem previsão</dt>
                <dd className="font-medium">{riskSummary.withoutScheduleRisk}</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Tendência de desperdício</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Melhorando</dt>
                <dd className="font-medium">{trendSummary.improving}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estável</dt>
                <dd className="font-medium">{trendSummary.stable}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Piorando</dt>
                <dd className="font-medium">{trendSummary.degrading}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Dados insuficientes</dt>
                <dd className="font-medium">{trendSummary.insufficientData}</dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
