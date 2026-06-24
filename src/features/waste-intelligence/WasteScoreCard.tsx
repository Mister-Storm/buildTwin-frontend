import { AlertTriangle, Gauge, ShieldAlert, Target } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";

type WasteScoreCardProps = {
  wasteScoreLabel: string;
  materialsAtRiskLabel: string;
  criticalMaterialsLabel: string;
  confidenceLabel: string;
  benchmarkVersionLabel: string;
};

export function WasteScoreCard({
  wasteScoreLabel,
  materialsAtRiskLabel,
  criticalMaterialsLabel,
  confidenceLabel,
  benchmarkVersionLabel,
}: WasteScoreCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Gauge} label="Waste Score" value={wasteScoreLabel} />
        <MetricCard
          icon={AlertTriangle}
          label="Materiais em Risco"
          value={materialsAtRiskLabel}
        />
        <MetricCard
          icon={ShieldAlert}
          label="Materiais Críticos"
          value={criticalMaterialsLabel}
        />
        <MetricCard
          icon={Target}
          label="Confiança"
          value={confidenceLabel}
          subtitle={`Benchmark ${benchmarkVersionLabel}`}
        />
      </div>
    </div>
  );
}
