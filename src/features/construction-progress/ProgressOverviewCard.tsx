import type { ConstructionProgressViewModel } from "@/features/construction-progress/progress-metrics.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

type ProgressOverviewCardProps = {
  viewModel: ConstructionProgressViewModel;
};

export function ProgressOverviewCard({ viewModel }: ProgressOverviewCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="size-5 text-brand-accent" />
          Progresso da Obra
        </CardTitle>
        <CardDescription>
          Evolução baseada na área observada pelo ortomosaico (terreno monitorado), não em área
          construída real.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <p className="text-muted-foreground">Período analisado</p>
          <p className="font-medium">{viewModel.periodLabel}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Levantamentos com área</p>
          <p className="font-medium">{viewModel.timelineSize}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Cobertura de dados</p>
          <p className="font-medium">{viewModel.dataCoverageLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}
