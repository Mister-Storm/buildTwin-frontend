import type { ComparisonViewModel } from "@/features/domain/models/temporal-comparison";
import type { AreaEvolutionMetrics } from "@/features/progress-intelligence/area-evolution-metrics";
import { buildAreaEvolutionSummary } from "@/features/progress-intelligence/area-evolution-summary";
import { MetricCard } from "@/components/shared/MetricCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatAreaDelta,
  formatGrowthRate,
  formatIntervalDays,
  formatPercent,
} from "@/lib/formatters";
import { Activity, Calendar, MapPinned, TrendingUp } from "lucide-react";

type AreaEvolutionCardProps = {
  viewModel: ComparisonViewModel;
  metrics: AreaEvolutionMetrics;
};

const UNAVAILABLE = "Não disponível";

function formatArea(value: number | null): string {
  if (value === null) {
    return UNAVAILABLE;
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} m²`;
}

export function AreaEvolutionCard({
  viewModel,
  metrics,
}: AreaEvolutionCardProps) {
  const summaryLines = buildAreaEvolutionSummary(metrics);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Evolução da Obra</CardTitle>
        <CardDescription>
          Indicadores de progresso entre{" "}
          {viewModel.captureSessionA.captureDateLabel} e {viewModel.captureSessionB.captureDateLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            icon={MapPinned}
            label="Área Atual"
            value={formatArea(viewModel.captureSessionB.areaSquareMeters)}
          />
          <MetricCard
            icon={MapPinned}
            label="Área Anterior"
            value={formatArea(viewModel.captureSessionA.areaSquareMeters)}
          />
          <MetricCard
            icon={TrendingUp}
            label="Crescimento"
            value={formatAreaDelta(metrics.areaDelta)}
          />
          <MetricCard
            icon={Activity}
            label="Crescimento %"
            value={formatPercent(metrics.areaDeltaPercent)}
          />
          <MetricCard
            icon={Calendar}
            label="Dias entre levantamentos"
            value={
              metrics.daysBetween !== null
                ? formatIntervalDays(metrics.daysBetween)
                : UNAVAILABLE
            }
          />
          <MetricCard
            icon={TrendingUp}
            label="Taxa média de evolução"
            value={formatGrowthRate(metrics.growthPerDay)}
          />
        </div>

        <div className="space-y-2 rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
          {summaryLines.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-foreground">
              {line}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
