import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExecutiveExplanationCard } from "@/features/executive-intelligence/ExecutiveExplanationCard";
import { ExecutiveHealthCard } from "@/features/executive-intelligence/ExecutiveHealthCard";
import type { ExecutiveIntelligenceViewModel } from "@/features/executive-intelligence/executive-intelligence.mapper";
import { ProductivityCard } from "@/features/executive-intelligence/ProductivityCard";
import { VelocityCard } from "@/features/executive-intelligence/VelocityCard";
import { WasteTrendCard } from "@/features/executive-intelligence/WasteTrendCard";

type ExecutiveIntelligenceSectionProps = {
  viewModel: ExecutiveIntelligenceViewModel;
};

export function ExecutiveIntelligenceSection({
  viewModel,
}: ExecutiveIntelligenceSectionProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Inteligência Executiva</CardTitle>
        <CardDescription>
          Indicadores de negócio derivados das medições existentes. Atualizado em{" "}
          {viewModel.generatedAtLabel}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ExecutiveHealthCard viewModel={viewModel} />
          <VelocityCard
            builtAreaVelocityLabel={viewModel.builtAreaVelocityLabel}
            floorVelocityLabel={viewModel.floorVelocityLabel}
          />
          <ProductivityCard viewModel={viewModel} />
          <WasteTrendCard
            wasteTrend={viewModel.wasteTrend}
            wasteTrendLabel={viewModel.wasteTrendLabel}
          />
        </div>
        <ExecutiveExplanationCard explanation={viewModel.healthExplanation} />
      </CardContent>
    </Card>
  );
}
