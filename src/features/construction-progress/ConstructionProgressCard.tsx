import type { ConstructionProgressTimelineViewModel } from "@/features/construction-progress/construction-progress.mapper";
import { MetricCard } from "@/components/shared/MetricCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Eye, MapPinned, Percent, TrendingUp } from "lucide-react";

type ConstructionProgressCardProps = {
  viewModel: ConstructionProgressTimelineViewModel;
};

export function ConstructionProgressCard({ viewModel }: ConstructionProgressCardProps) {
  const latest = viewModel.latest;

  if (!latest) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Progresso da Obra</CardTitle>
          <CardDescription>
            Ocupação do terreno e alterações visuais observadas nos levantamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum dado de ocupação disponível para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Progresso da Obra</CardTitle>
        <CardDescription>
          Métricas observadas no terreno. O índice de ocupação não representa conclusão da obra.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={MapPinned}
            label="Ocupação Atual"
            value={latest.occupiedAreaLabel}
          />
          <MetricCard
            icon={Percent}
            label="Índice de Ocupação do Terreno"
            value={latest.footprintIndexLabel}
            subtitle="Relativo ao maior footprint observado no histórico"
          />
          <MetricCard
            icon={Eye}
            label="Alteração Visual"
            value={latest.visualChangeLabel}
            subtitle="Comparado ao levantamento anterior"
          />
          <MetricCard
            icon={TrendingUp}
            label="Crescimento desde o Levantamento Anterior"
            value={viewModel.footprintGrowthSincePreviousLabel}
          />
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="size-3.5" />
          Levantamento #{latest.captureSessionSequence} · {latest.captureDateLabel}
        </p>
      </CardContent>
    </Card>
  );
}
