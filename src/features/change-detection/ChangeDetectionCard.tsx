import {
  getChangeLevelLabel,
  getChangeLevelVariant,
  getComparisonQualityLabel,
  getComparisonQualityVariant,
  LOW_COMPARISON_QUALITY_WARNING,
} from "@/features/change-detection/change-level-mapper";
import type { ChangeDetectionViewModel } from "@/features/change-detection/change-detection.mapper";
import { HeatmapViewer } from "@/features/change-detection/HeatmapViewer";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, AlertTriangle, Crosshair, ScanSearch } from "lucide-react";

type ChangeDetectionCardProps = {
  viewModel: ChangeDetectionViewModel;
};

export function ChangeDetectionCard({ viewModel }: ChangeDetectionCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScanSearch className="size-5 text-brand-accent" />
          Mudanças Detectadas
        </CardTitle>
        <CardDescription>
          Detecção visual determinística entre os levantamentos selecionados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {viewModel.comparisonQuality === "LOW" ? (
          <div className="flex items-start gap-3 rounded-lg border border-brand-warning/30 bg-brand-warning/10 px-4 py-3 text-sm text-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-brand-warning" />
            <p>{LOW_COMPARISON_QUALITY_WARNING}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={`Nível: ${getChangeLevelLabel(viewModel.changeLevel)}`}
            variant={getChangeLevelVariant(viewModel.changeLevel)}
          />
          <StatusBadge
            label={`Qualidade: ${getComparisonQualityLabel(viewModel.comparisonQuality)}`}
            variant={getComparisonQualityVariant(viewModel.comparisonQuality)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={Activity}
            label="Percentual de alteração"
            value={viewModel.changePercentageLabel}
          />
          <MetricCard
            icon={Crosshair}
            label="Pixels alterados"
            value={viewModel.changedPixelsLabel}
          />
        </div>

        <HeatmapViewer previewUrl={viewModel.heatmapPreviewUrl} />
      </CardContent>
    </Card>
  );
}
