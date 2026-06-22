"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { debugLog } from "@/lib/debug";
import { LineChart } from "lucide-react";

type ProgressEvolutionChartPoint = {
  flightDateLabel: string;
  footprintIndex: number;
};

type ProgressEvolutionChartProps = {
  points: ProgressEvolutionChartPoint[];
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 240;
const PADDING = 40;

export function ProgressEvolutionChart({ points }: ProgressEvolutionChartProps) {
  useEffect(() => {
    debugLog("construction_progress_chart_rendered", { pointCount: points.length });
  }, [points.length]);

  if (points.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Evolução do Índice de Ocupação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum dado disponível para exibir o gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  const values = points.map((point) => point.footprintIndex);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const plottedPoints = points.map((point, index) => {
    const x =
      points.length === 1
        ? CHART_WIDTH / 2
        : PADDING + (index / (points.length - 1)) * (CHART_WIDTH - PADDING * 2);
    const y =
      CHART_HEIGHT -
      PADDING -
      ((point.footprintIndex - minValue) / range) * (CHART_HEIGHT - PADDING * 2);
    return { x, y, point };
  });

  const polyline = plottedPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LineChart className="size-5 text-brand-accent" />
          Evolução do Índice de Ocupação
        </CardTitle>
        <CardDescription>
          Índice relativo de ocupação do terreno ao longo dos levantamentos. Não representa
          conclusão da obra.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-auto w-full min-w-[320px] text-foreground"
            role="img"
            aria-label="Gráfico de evolução do índice de ocupação do terreno por data de levantamento"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-brand-accent"
              points={polyline}
            />
            {plottedPoints.map(({ x, y, point }) => (
              <g key={`${point.flightDateLabel}-${point.footprintIndex}`}>
                <circle cx={x} cy={y} r="4" className="fill-brand-accent" />
                <title>
                  {point.flightDateLabel}: {(point.footprintIndex * 100).toFixed(0)}%
                </title>
              </g>
            ))}
          </svg>
        </div>
        <ul className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {points.map((point) => (
            <li key={point.flightDateLabel}>
              {point.flightDateLabel}: {(point.footprintIndex * 100).toFixed(0)}%
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
