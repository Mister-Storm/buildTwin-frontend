import type { ConstructionProgressViewModel } from "@/features/construction-progress/progress-metrics.mapper";
import { MetricCard } from "@/components/shared/MetricCard";
import { Activity, Calendar, MapPinned, Percent, TrendingUp } from "lucide-react";

type ProgressMetricsGridProps = {
  viewModel: ConstructionProgressViewModel;
};

export function ProgressMetricsGrid({ viewModel }: ProgressMetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard
        icon={MapPinned}
        label="Área Observada Atual"
        value={viewModel.currentObservedAreaLabel}
      />
      <MetricCard
        icon={TrendingUp}
        label="Evolução Acumulada"
        value={viewModel.accumulatedEvolutionLabel}
      />
      <MetricCard
        icon={Activity}
        label="Última Evolução"
        value={viewModel.lastEvolutionLabel}
      />
      <MetricCard
        icon={Calendar}
        label="Crescimento Médio"
        value={viewModel.averageGrowthLabel}
      />
      {viewModel.showEstimatedCompletion ? (
        <MetricCard
          icon={Percent}
          label="Conclusão Estimada"
          value={viewModel.estimatedCompletionLabel ?? "Não disponível"}
        />
      ) : null}
    </div>
  );
}
