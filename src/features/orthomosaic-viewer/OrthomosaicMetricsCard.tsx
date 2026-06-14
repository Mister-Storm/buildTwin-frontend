import type { OrthomosaicViewModel } from "@/features/domain/models/orthomosaic";
import { MetricCard } from "@/components/shared/MetricCard";
import {
  Calendar,
  Crosshair,
  Layers3,
  MapPinned,
  Ruler,
} from "lucide-react";

type OrthomosaicMetricsCardProps = {
  viewModel: OrthomosaicViewModel;
};

export function OrthomosaicMetricsCard({ viewModel }: OrthomosaicMetricsCardProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Levantamento</h2>
        <p className="text-sm text-muted-foreground">
          Métricas geoespaciais extraídas do ortomosaico processado
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          icon={Calendar}
          label="Data do Levantamento"
          value={viewModel.captureDateLabel ?? "Não disponível"}
        />
        <MetricCard
          icon={MapPinned}
          label="Área Coberta"
          value={viewModel.areaLabel ?? "Não disponível"}
        />
        <MetricCard
          icon={Crosshair}
          label="Resolução"
          value={viewModel.gsdLabel ?? "Não disponível"}
        />
        <MetricCard
          icon={Layers3}
          label="Sistema de Coordenadas"
          value={viewModel.crs ?? "Não disponível"}
        />
        <MetricCard
          icon={Ruler}
          label="Dimensões"
          value={viewModel.dimensionsLabel ?? "Não disponível"}
        />
      </div>
    </section>
  );
}
