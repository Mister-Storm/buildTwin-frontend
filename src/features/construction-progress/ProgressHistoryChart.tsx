"use client";

import { useEffect } from "react";
import type { ConstructionProgressHistoryPoint } from "@/features/construction-progress/progress-metrics.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { debugLog } from "@/lib/debug";
import { LineChart } from "lucide-react";

type ProgressHistoryChartProps = {
  history: ConstructionProgressHistoryPoint[];
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 240;
const PADDING = 40;

export function ProgressHistoryChart({ history }: ProgressHistoryChartProps) {
  useEffect(() => {
    debugLog("project_progress_chart_rendered", { pointCount: history.length });
  }, [history.length]);

  if (history.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Área Observada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum dado disponível para exibir o gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  const areas = history.map((point) => point.observedAreaSquareMeters);
  const minArea = Math.min(...areas);
  const maxArea = Math.max(...areas);
  const range = maxArea - minArea || 1;

  const points = history.map((point, index) => {
    const x =
      history.length === 1
        ? CHART_WIDTH / 2
        : PADDING + (index / (history.length - 1)) * (CHART_WIDTH - PADDING * 2);
    const y =
      CHART_HEIGHT -
      PADDING -
      ((point.observedAreaSquareMeters - minArea) / range) * (CHART_HEIGHT - PADDING * 2);
    return { x, y, point };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LineChart className="size-5 text-brand-accent" />
          Histórico de Área Observada
        </CardTitle>
        <CardDescription>
          Evolução temporal da área monitorada pelo ortomosaico em cada levantamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-auto w-full max-w-full"
          role="img"
          aria-label="Gráfico de área observada ao longo do tempo"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            className="text-brand-accent"
            strokeWidth="2"
            points={polyline}
          />
          {points.map(({ x, y, point }) => (
            <g key={point.captureSessionId}>
              <circle cx={x} cy={y} r="4" className="fill-brand-accent" />
              <title>
                {point.captureDateLabel}: {point.observedAreaSquareMeters.toLocaleString("pt-BR")} m²
              </title>
            </g>
          ))}
        </svg>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {history.map((point) => (
            <span key={point.captureSessionId}>
              {point.captureDateLabel}: {point.observedAreaSquareMeters.toLocaleString("pt-BR")} m²
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
