import { Grid3x3 } from "lucide-react";
import { HeatmapCard } from "@/features/spatial-intelligence/HeatmapCard";
import type { SpatialIntelligenceViewModel } from "@/features/spatial-intelligence/spatial-intelligence.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SpatialHeatmapsSectionProps = {
  viewModel: SpatialIntelligenceViewModel;
};

const ORTHOMOSAIC_METRICS = ["WASTE", "PRODUCTIVITY", "PROGRESS", "COVERAGE"] as const;

export function SpatialHeatmapsSection({ viewModel }: SpatialHeatmapsSectionProps) {
  const heatmaps = viewModel.heatmaps.filter((heatmap) =>
    ORTHOMOSAIC_METRICS.includes(heatmap.metric as (typeof ORTHOMOSAIC_METRICS)[number]),
  );

  if (heatmaps.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="size-5 text-brand-accent" />
          Mapas de calor espaciais
        </CardTitle>
        <CardDescription>
          Visualização CSS da grade espacial — complemento ao ortomosaico, sem SDK de mapas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {heatmaps.map((heatmap) => (
            <HeatmapCard key={heatmap.metric} heatmap={heatmap} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
