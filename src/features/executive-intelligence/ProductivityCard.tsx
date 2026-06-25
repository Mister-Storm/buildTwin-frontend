import { Boxes } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BenchmarkBadge } from "@/features/benchmark-intelligence/BenchmarkBadge";
import type { BenchmarkPositionViewModel } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import type { ExecutiveIntelligenceViewModel } from "@/features/executive-intelligence/executive-intelligence.mapper";

type ProductivityCardProps = {
  viewModel: Pick<
    ExecutiveIntelligenceViewModel,
    | "productivityIndexLabel"
    | "productivityClassificationLabel"
    | "productivityClassificationVariant"
    | "productivityTooltip"
  > & {
    productivityBenchmark?: BenchmarkPositionViewModel | null;
  };
};

export function ProductivityCard({ viewModel }: ProductivityCardProps) {
  return (
    <div title={viewModel.productivityTooltip}>
      <MetricCard
        icon={Boxes}
        label="Produtividade Material"
        value={viewModel.productivityIndexLabel}
        subtitle={
          <div>
            {viewModel.productivityClassificationLabel &&
            viewModel.productivityClassificationVariant ? (
              <StatusBadge
                label={viewModel.productivityClassificationLabel}
                variant={viewModel.productivityClassificationVariant}
              />
            ) : (
              <span>Classificação indisponível</span>
            )}
            <BenchmarkBadge benchmark={viewModel.productivityBenchmark} />
          </div>
        }
      />
    </div>
  );
}
