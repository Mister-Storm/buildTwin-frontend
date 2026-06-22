import { generateConstructionProgressInsights } from "@/features/construction-progress/construction-progress-insight-generator";
import type { ConstructionProgressTimelineViewModel } from "@/features/construction-progress/construction-progress.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

type ConstructionProgressInsightsSectionProps = {
  viewModel: ConstructionProgressTimelineViewModel;
};

export function ConstructionProgressInsightsSection({
  viewModel,
}: ConstructionProgressInsightsSectionProps) {
  const insights = generateConstructionProgressInsights(viewModel.timeline);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="size-5 text-brand-accent" />
          Insights de Ocupação
        </CardTitle>
        <CardDescription>
          Observações determinísticas baseadas em footprint e alteração visual observados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {insights.map((insight) => (
            <li key={insight} className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
              {insight}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
