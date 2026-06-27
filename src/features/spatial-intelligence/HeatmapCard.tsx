import type { HeatmapViewModel } from "@/features/spatial-intelligence/spatial-intelligence.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type HeatmapCardProps = {
  heatmap: HeatmapViewModel;
};

function heatColor(value: number): string {
  const intensity = Math.max(0, Math.min(1, value));
  return `rgba(37, 99, 235, ${intensity.toFixed(3)})`;
}

export function HeatmapCard({ heatmap }: HeatmapCardProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{heatmap.metricLabel}</CardTitle>
        <CardDescription>
          Matriz normalizada {heatmap.rows}×{heatmap.cols} (0–1)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="grid gap-0.5 rounded-lg border border-border/60 p-2"
          style={{
            gridTemplateColumns: `repeat(${heatmap.cols}, minmax(0, 1fr))`,
          }}
          data-testid={`heatmap-grid-${heatmap.metric}`}
        >
          {heatmap.values.flatMap((row, rowIndex) =>
            row.map((value, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square rounded-sm"
                style={{ backgroundColor: heatColor(value) }}
                title={`${value.toFixed(2)}`}
              />
            )),
          )}
        </div>
      </CardContent>
    </Card>
  );
}
