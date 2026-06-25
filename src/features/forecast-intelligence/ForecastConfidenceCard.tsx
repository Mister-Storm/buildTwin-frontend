import { ShieldCheck } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ForecastIntelligenceViewModel } from "@/features/forecast-intelligence/forecast-intelligence.mapper";

type ForecastConfidenceCardProps = {
  viewModel: Pick<
    ForecastIntelligenceViewModel,
    "confidenceLabel" | "confidenceVariant"
  >;
};

export function ForecastConfidenceCard({ viewModel }: ForecastConfidenceCardProps) {
  return (
    <MetricCard
      icon={ShieldCheck}
      label="Confiança da Previsão"
      value={viewModel.confidenceLabel}
      subtitle={
        <StatusBadge
          label={viewModel.confidenceLabel}
          variant={viewModel.confidenceVariant}
        />
      }
    />
  );
}
