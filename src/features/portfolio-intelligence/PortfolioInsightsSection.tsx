import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { PortfolioInsightViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";

type PortfolioInsightsSectionProps = {
  insights: PortfolioInsightViewModel[];
};

export function PortfolioInsightsSection({ insights }: PortfolioInsightsSectionProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Insights do portfólio</CardTitle>
        <CardDescription>
          Alertas determinísticos derivados dos indicadores agregados. Não são recomendações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={`${insight.title}-${insight.severity}`}
            className="flex flex-col gap-2 rounded-lg border border-border/60 p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <p className="font-medium">{insight.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
            </div>
            <StatusBadge label={insight.severityLabel} variant={insight.severityVariant} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
