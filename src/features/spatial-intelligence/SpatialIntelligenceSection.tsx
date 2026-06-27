import { Map } from "lucide-react";
import { HotspotCard } from "@/features/spatial-intelligence/HotspotCard";
import { SpatialSummaryCard } from "@/features/spatial-intelligence/SpatialSummaryCard";
import type { SpatialIntelligenceViewModel } from "@/features/spatial-intelligence/spatial-intelligence.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SpatialIntelligenceSectionProps = {
  viewModel: SpatialIntelligenceViewModel;
};

export function SpatialIntelligenceSection({
  viewModel,
}: SpatialIntelligenceSectionProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="size-5 text-brand-accent" />
          Inteligência Espacial
        </CardTitle>
        <CardDescription>
          Distribuição regional determinística da última captura processada. Atualizado em{" "}
          {viewModel.generatedAtLabel}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {viewModel.summary ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <SpatialSummaryCard summary={viewModel.summary} />
          </div>
        ) : null}
        <HotspotCard hotspots={viewModel.hotspots} />
        {viewModel.spatialExplanation ? (
          <p className="text-sm text-muted-foreground">{viewModel.spatialExplanation.summary}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
