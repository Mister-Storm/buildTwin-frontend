"use client";

import { useEffect } from "react";
import type { BuiltAreaChartPoint } from "@/features/built-area/built-area.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { debugLog } from "@/lib/debug";
import { LineChart } from "lucide-react";

type BuiltAreaEvolutionChartProps = {
  points: BuiltAreaChartPoint[];
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 240;
const PADDING = 40;

export function BuiltAreaEvolutionChart({ points }: BuiltAreaEvolutionChartProps) {
  useEffect(() => {
    debugLog("built_area_chart_rendered", { pointCount: points.length });
  }, [points.length]);

  if (points.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Evolução da Área Construída</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum dado disponível para exibir o gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  const areas = points.map((point) => point.observedBuiltAreaSquareMeters);
  const minArea = Math.min(...areas);
  const maxArea = Math.max(...areas);
  const range = maxArea - minArea || 1;

  const chartPoints = points.map((point, index) => {
    const x =
      points.length === 1
        ? CHART_WIDTH / 2
        : PADDING + (index / (points.length - 1)) * (CHART_WIDTH - PADDING * 2);
    const y =
      CHART_HEIGHT -
      PADDING -
      ((point.observedBuiltAreaSquareMeters - minArea) / range) * (CHART_HEIGHT - PADDING * 2);
    return { x, y, point };
  });

  const polyline = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LineChart className="size-5 text-brand-accent" />
          Evolução da Área Construída
        </CardTitle>
        <CardDescription>
          Histórico de área construída registrada manualmente por levantamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-auto w-full max-w-full"
          role="img"
          aria-label="Gráfico de área construída ao longo do tempo"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            className="text-brand-accent"
            strokeWidth="2"
            points={polyline}
          />
          {chartPoints.map(({ x, y, point }) => (
            <g key={point.captureSessionId}>
              <circle cx={x} cy={y} r="4" className="fill-brand-accent" />
              <title>
                {point.captureDateLabel}:{" "}
                {point.observedBuiltAreaSquareMeters.toLocaleString("pt-BR")} m²
              </title>
            </g>
          ))}
        </svg>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {points.map((point) => (
            <span key={point.captureSessionId}>
              {point.captureDateLabel}:{" "}
              {point.observedBuiltAreaSquareMeters.toLocaleString("pt-BR")} m²
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
