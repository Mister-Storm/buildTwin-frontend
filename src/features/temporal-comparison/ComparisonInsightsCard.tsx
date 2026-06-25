import type { ChangeAnalytics } from "@/features/temporal-comparison/analytics/change-analytics";
import {
  formatSignedArea,
  formatSignedPercent,
  resolveDeltaDirection,
} from "@/features/temporal-comparison/analytics/change-analytics";
import { DeltaIndicator } from "@/features/temporal-comparison/analytics/DeltaIndicator";
import {
  describeGsdQualityChange,
  getChangeSummaryLabel,
  getChangeSummaryMessage,
  getChangeSummaryVariant,
} from "@/features/temporal-comparison/analytics/change-summary-mapper";
import type { ComparisonViewModel } from "@/features/domain/models/temporal-comparison";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock3, Crosshair, MapPinned, Sparkles } from "lucide-react";

type ComparisonInsightsCardProps = {
  viewModel: ComparisonViewModel;
  analytics: ChangeAnalytics;
};

const UNAVAILABLE = "Não disponível";

function formatArea(value: number | null): string {
  if (value === null) {
    return UNAVAILABLE;
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} m²`;
}

function formatGsd(value: number | null): string {
  if (value === null) {
    return UNAVAILABLE;
  }
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} cm/pixel`;
}

export function ComparisonInsightsCard({
  viewModel,
  analytics,
}: ComparisonInsightsCardProps) {
  const areaDirection = resolveDeltaDirection(analytics.areaDelta);
  const gsdDirection = resolveDeltaDirection(
    analytics.gsdDelta === null ? null : -analytics.gsdDelta,
  );

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-brand-accent" />
              Análise de Evolução
            </CardTitle>
            <CardDescription className="mt-1">
              Levantamento mais recente: {viewModel.captureSessionB.captureDateLabel}
            </CardDescription>
          </div>
          <StatusBadge
            label={getChangeSummaryLabel(analytics.summary)}
            variant={getChangeSummaryVariant(analytics.summary)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
          {getChangeSummaryMessage(analytics.summary)}
        </p>
        <p className="text-sm text-muted-foreground">
          {describeGsdQualityChange(analytics.gsdDelta)}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            icon={Clock3}
            label="Intervalo entre capturas"
            value={viewModel.intervalDaysLabel}
          />
          <MetricCard
            icon={MapPinned}
            label="Área anterior"
            value={formatArea(analytics.areaA)}
          />
          <MetricCard
            icon={MapPinned}
            label="Área atual"
            value={formatArea(analytics.areaB)}
            subtitle={
              analytics.areaDelta !== null ? (
                <span className="inline-flex items-center gap-1">
                  <DeltaIndicator direction={areaDirection} />
                  {formatSignedArea(analytics.areaDelta)}
                </span>
              ) : (
                UNAVAILABLE
              )
            }
          />
          <MetricCard
            icon={MapPinned}
            label="Variação percentual"
            value={
              analytics.areaDeltaPercent !== null
                ? formatSignedPercent(analytics.areaDeltaPercent)
                : UNAVAILABLE
            }
            subtitle={
              <span className="inline-flex items-center gap-1">
                <DeltaIndicator direction={areaDirection} />
                Área monitorada
              </span>
            }
          />
          <MetricCard
            icon={Crosshair}
            label="Resolução (GSD)"
            value={`${formatGsd(analytics.gsdA)} → ${formatGsd(analytics.gsdB)}`}
            subtitle={
              analytics.gsdDelta !== null ? (
                <span className="inline-flex items-center gap-1">
                  <DeltaIndicator direction={gsdDirection} />
                  Qualidade espacial
                </span>
              ) : (
                UNAVAILABLE
              )
            }
          />
          <MetricCard
            icon={Calendar}
            label="Período analisado"
            value={`${viewModel.captureSessionA.captureDateLabel} → ${viewModel.captureSessionB.captureDateLabel}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
