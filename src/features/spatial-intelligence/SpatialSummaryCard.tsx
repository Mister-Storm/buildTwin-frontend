import { MapPin } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import type { SpatialSummaryViewModel } from "@/features/spatial-intelligence/spatial-intelligence.mapper";

type SpatialSummaryCardProps = {
  summary: SpatialSummaryViewModel;
};

export function SpatialSummaryCard({ summary }: SpatialSummaryCardProps) {
  return (
    <MetricCard
      icon={MapPin}
      label="Região dominante"
      value={summary.dominantRegionLabel ?? "—"}
      subtitle={
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Grade {summary.gridLabel}</p>
          {summary.coverageLabel ? <p>Cobertura: {summary.coverageLabel}</p> : null}
        </div>
      }
    />
  );
}
