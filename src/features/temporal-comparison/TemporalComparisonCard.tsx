import type { ComparisonViewModel } from "@/features/domain/models/temporal-comparison";
import { MetricCard } from "@/components/shared/MetricCard";
import { Calendar, Clock3, Crosshair, MapPinned } from "lucide-react";

type TemporalComparisonCardProps = {
  viewModel: ComparisonViewModel;
};

export function TemporalComparisonCard({ viewModel }: TemporalComparisonCardProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Comparativo</h2>
        <p className="text-sm text-muted-foreground">
          Evolução entre dois levantamentos processados da mesma obra
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={MapPinned}
          label="Área Coberta"
          value={`${viewModel.captureSessionA.areaLabel ?? "—"} → ${viewModel.captureSessionB.areaLabel ?? "—"}`}
          subtitle={`Diferença: ${viewModel.deltaAreaLabel ?? "Não disponível"}`}
        />
        <MetricCard
          icon={Crosshair}
          label="Resolução (GSD)"
          value={`${viewModel.captureSessionA.gsdLabel ?? "—"} → ${viewModel.captureSessionB.gsdLabel ?? "—"}`}
          subtitle={`Diferença: ${viewModel.deltaGsdLabel ?? "Não disponível"}`}
        />
        <MetricCard
          icon={Calendar}
          label="Data do levantamento"
          value={`${viewModel.captureSessionA.captureDateLabel} → ${viewModel.captureSessionB.captureDateLabel}`}
          subtitle={`Intervalo: ${viewModel.intervalDaysLabel}`}
        />
        <MetricCard
          icon={Clock3}
          label="Sequência"
          value={`#${viewModel.captureSessionA.sequenceNumber} → #${viewModel.captureSessionB.sequenceNumber}`}
        />
      </div>
    </section>
  );
}
