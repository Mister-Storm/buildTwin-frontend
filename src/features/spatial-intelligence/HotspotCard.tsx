import { Flame } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { SpatialHotspotViewModel } from "@/features/spatial-intelligence/spatial-intelligence.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type HotspotCardProps = {
  hotspots: SpatialHotspotViewModel[];
};

export function HotspotCard({ hotspots }: HotspotCardProps) {
  const topHotspots = hotspots.slice(0, 3);

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="size-5 text-brand-warning" />
          Hotspots espaciais
        </CardTitle>
        <CardDescription>
          Concentrações regionais derivadas da grade determinística — sem mapa GIS.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topHotspots.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum hotspot identificado.</p>
        ) : (
          <ul className="space-y-3">
            {topHotspots.map((hotspot, index) => (
              <li
                key={`${hotspot.regionLabel}-${hotspot.metricLabel}-${index}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {hotspot.metricLabel} — {hotspot.regionLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">{hotspot.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge label={hotspot.severityLabel} variant={hotspot.severityVariant} />
                  <span className="text-xs text-muted-foreground">{hotspot.valueLabel}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
