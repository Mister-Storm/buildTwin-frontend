import { Activity } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ExecutiveIntelligenceViewModel } from "@/features/executive-intelligence/executive-intelligence.mapper";

type ExecutiveHealthCardProps = {
  viewModel: Pick<
    ExecutiveIntelligenceViewModel,
    | "constructionHealthScoreLabel"
    | "healthClassificationLabel"
    | "healthClassificationVariant"
  >;
};

export function ExecutiveHealthCard({ viewModel }: ExecutiveHealthCardProps) {
  return (
    <MetricCard
      icon={Activity}
      label="Saúde da Obra"
      value={viewModel.constructionHealthScoreLabel}
      subtitle={
        <StatusBadge
          label={viewModel.healthClassificationLabel}
          variant={viewModel.healthClassificationVariant}
        />
      }
    />
  );
}
