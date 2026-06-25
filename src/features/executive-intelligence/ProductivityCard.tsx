import { Boxes } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ExecutiveIntelligenceViewModel } from "@/features/executive-intelligence/executive-intelligence.mapper";

type ProductivityCardProps = {
  viewModel: Pick<
    ExecutiveIntelligenceViewModel,
    | "productivityIndexLabel"
    | "productivityClassificationLabel"
    | "productivityClassificationVariant"
    | "productivityTooltip"
  >;
};

export function ProductivityCard({ viewModel }: ProductivityCardProps) {
  return (
    <div title={viewModel.productivityTooltip}>
      <MetricCard
        icon={Boxes}
        label="Produtividade Material"
        value={viewModel.productivityIndexLabel}
        subtitle={
          viewModel.productivityClassificationLabel &&
          viewModel.productivityClassificationVariant ? (
            <StatusBadge
              label={viewModel.productivityClassificationLabel}
              variant={viewModel.productivityClassificationVariant}
            />
          ) : (
            "Classificação indisponível"
          )
        }
      />
    </div>
  );
}
