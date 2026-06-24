import { Boxes, Ruler } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";

type ConsumptionAnalysisMetricsCardsProps = {
  builtAreaDeltaLabel: string;
  totalConsumedMaterialsLabel: string;
};

export function ConsumptionAnalysisMetricsCards({
  builtAreaDeltaLabel,
  totalConsumedMaterialsLabel,
}: ConsumptionAnalysisMetricsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MetricCard icon={Ruler} label="Área produzida" value={builtAreaDeltaLabel} />
      <MetricCard
        icon={Boxes}
        label="Total de materiais consumidos"
        value={totalConsumedMaterialsLabel}
      />
    </div>
  );
}
