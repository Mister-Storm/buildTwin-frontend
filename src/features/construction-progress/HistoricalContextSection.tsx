import {
  formatParticipationPercent,
  type ConstructionProgressViewModel,
} from "@/features/construction-progress/progress-metrics.mapper";
import { formatAreaDelta } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History } from "lucide-react";

type HistoricalContextSectionProps = {
  comparisonAreaDelta: number | null;
  progress: ConstructionProgressViewModel;
};

export function HistoricalContextSection({
  comparisonAreaDelta,
  progress,
}: HistoricalContextSectionProps) {
  const participation = formatParticipationPercent(
    comparisonAreaDelta,
    progress.deltaAreaFromFirstCapture,
  );

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="size-5 text-brand-accent" />
          Contexto Histórico
        </CardTitle>
        <CardDescription>
          Contribuição desta comparação na evolução acumulada da área observada.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
        <div>
          <p className="text-muted-foreground">Área impactada nesta comparação</p>
          <p className="text-lg font-semibold">{formatAreaDelta(comparisonAreaDelta)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Evolução acumulada</p>
          <p className="text-lg font-semibold">{progress.accumulatedEvolutionLabel}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Participação</p>
          <p className="text-lg font-semibold">{participation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
