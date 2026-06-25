"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import type { DistributionChartViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";

const CHART_WIDTH = 480;
const BAR_HEIGHT = 28;
const BAR_GAP = 12;
const LABEL_WIDTH = 120;

type PortfolioDistributionChartProps = {
  viewModel: DistributionChartViewModel;
};

export function PortfolioDistributionChart({ viewModel }: PortfolioDistributionChartProps) {
  const { title, description, buckets } = viewModel;
  const chartHeight = buckets.length * (BAR_HEIGHT + BAR_GAP) + 20;

  if (buckets.every((bucket) => bucket.count === 0)) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="size-5 text-brand-accent" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="size-5 text-brand-accent" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${chartHeight}`}
            className="h-auto w-full min-w-[280px] text-foreground"
            role="img"
            aria-label={title}
          >
            {buckets.map((bucket, index) => {
              const y = index * (BAR_HEIGHT + BAR_GAP) + 10;
              const barMaxWidth = CHART_WIDTH - LABEL_WIDTH - 40;
              const barWidth = (bucket.barWidthPercent / 100) * barMaxWidth;
              return (
                <g key={bucket.label}>
                  <text
                    x={0}
                    y={y + BAR_HEIGHT / 2 + 4}
                    className="fill-muted-foreground text-[11px]"
                  >
                    {bucket.label}
                  </text>
                  <rect
                    x={LABEL_WIDTH}
                    y={y}
                    width={barWidth}
                    height={BAR_HEIGHT}
                    rx={4}
                    className="fill-brand-accent"
                  />
                  <text
                    x={LABEL_WIDTH + barWidth + 8}
                    y={y + BAR_HEIGHT / 2 + 4}
                    className="fill-foreground text-[11px] font-medium"
                  >
                    {bucket.count}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioHealthDistributionChart({
  viewModel,
}: {
  viewModel: DistributionChartViewModel;
}) {
  return <PortfolioDistributionChart viewModel={viewModel} />;
}

export function PortfolioRiskDistributionChart({
  viewModel,
}: {
  viewModel: DistributionChartViewModel;
}) {
  return <PortfolioDistributionChart viewModel={viewModel} />;
}

export function PortfolioProgressDistributionChart({
  viewModel,
}: {
  viewModel: DistributionChartViewModel;
}) {
  return <PortfolioDistributionChart viewModel={viewModel} />;
}
