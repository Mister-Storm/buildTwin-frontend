import { generateProgressInsight } from "@/features/progress-intelligence/progress-insight-generator";
import type { ProgressIntelligenceViewModel } from "@/features/progress-intelligence/progress-intelligence.mapper";
import { MetricCard } from "@/components/shared/MetricCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Calendar, Gauge, TrendingUp } from "lucide-react";

type ProgressIntelligenceCardProps = {
  viewModel: ProgressIntelligenceViewModel;
};

export function ProgressIntelligenceCard({ viewModel }: ProgressIntelligenceCardProps) {
  const insight = generateProgressInsight(viewModel.classification);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gauge className="size-5 text-brand-accent" />
          Indicador de Progresso
        </CardTitle>
        <CardDescription>
          Indicadores executivos de mudança visual entre os levantamentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Activity}
            label="Progresso observado"
            value={viewModel.changePercentageLabel}
          />
          <MetricCard
            icon={TrendingUp}
            label="Classificação"
            value={viewModel.classificationLabel}
          />
          <MetricCard
            icon={Gauge}
            label="Velocidade média"
            value={viewModel.averageDailyChangeLabel}
          />
          <MetricCard
            icon={Calendar}
            label="Período"
            value={viewModel.periodLabel}
          />
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
          <p className="text-sm leading-relaxed text-foreground">{insight}</p>
        </div>
      </CardContent>
    </Card>
  );
}
