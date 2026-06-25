import { Activity } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BenchmarkBadge } from "@/features/benchmark-intelligence/BenchmarkBadge";
import type { BenchmarkPositionViewModel } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import type { ExecutiveIntelligenceViewModel } from "@/features/executive-intelligence/executive-intelligence.mapper";

type ExecutiveHealthCardProps = {
  viewModel: Pick<
    ExecutiveIntelligenceViewModel,
    | "constructionHealthScoreLabel"
    | "healthClassificationLabel"
    | "healthClassificationVariant"
  > & {
    healthBenchmark?: BenchmarkPositionViewModel | null;
  };
};

export function ExecutiveHealthCard({ viewModel }: ExecutiveHealthCardProps) {
  return (
    <MetricCard
      icon={Activity}
      label="Saúde da Obra"
      value={viewModel.constructionHealthScoreLabel}
      subtitle={
        <div>
          <StatusBadge
            label={viewModel.healthClassificationLabel}
            variant={viewModel.healthClassificationVariant}
          />
          <BenchmarkBadge benchmark={viewModel.healthBenchmark} />
        </div>
      }
    />
  );
}
