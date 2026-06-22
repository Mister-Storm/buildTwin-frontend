import type { VerticalConstructionViewModel } from "@/features/vertical-construction/vertical-construction.mapper";
import { VerticalConstructionHistoryList } from "@/features/vertical-construction/VerticalConstructionHistoryList";
import { MetricCard } from "@/components/shared/MetricCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, Layers, Percent, Ruler, Target } from "lucide-react";

type VerticalConstructionSectionProps = {
  viewModel: VerticalConstructionViewModel;
};

export function VerticalConstructionSection({
  viewModel,
}: VerticalConstructionSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="size-5 text-brand-accent" />
            Construção Vertical
          </CardTitle>
          <CardDescription>
            Evolução de pavimentos e área construída registrada manualmente por levantamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              icon={Layers}
              label="Pavimentos Atuais"
              value={viewModel.currentFloorsLabel}
            />
            <MetricCard
              icon={Target}
              label="Pavimentos Planejados"
              value={viewModel.plannedFloorsLabel}
            />
            {viewModel.showVerticalCompletion ? (
              <MetricCard
                icon={Percent}
                label="Conclusão Vertical"
                value={viewModel.verticalCompletionLabel ?? "Não disponível"}
              />
            ) : null}
            <MetricCard
              icon={Ruler}
              label="Área Construída"
              value={viewModel.currentBuiltAreaLabel}
            />
            <MetricCard
              icon={Ruler}
              label="Área Média por Pavimento"
              value={viewModel.averageAreaPerFloorLabel}
            />
            <MetricCard
              icon={Ruler}
              label="Área Média Planejada/Pavimento"
              value={viewModel.plannedAverageAreaPerFloorLabel}
            />
          </div>
        </CardContent>
      </Card>

      <VerticalConstructionHistoryList rows={viewModel.historyRows} />
    </div>
  );
}
