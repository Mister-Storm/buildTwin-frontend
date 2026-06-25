import { ArrowDownRight, ArrowRight, ArrowUpRight, HelpCircle } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { BenchmarkBadge } from "@/features/benchmark-intelligence/BenchmarkBadge";
import type { BenchmarkPositionViewModel } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import type { TrendDirection } from "@/features/executive-intelligence/executive-intelligence.api";

type WasteTrendCardProps = {
  wasteTrend: TrendDirection;
  wasteTrendLabel: string;
  wasteBenchmark?: BenchmarkPositionViewModel | null;
};

export function WasteTrendCard({
  wasteTrend,
  wasteTrendLabel,
  wasteBenchmark,
}: WasteTrendCardProps) {
  const Icon =
    wasteTrend === "IMPROVING"
      ? ArrowUpRight
      : wasteTrend === "DEGRADING"
        ? ArrowDownRight
        : wasteTrend === "STABLE"
          ? ArrowRight
          : HelpCircle;

  return (
    <MetricCard
      icon={Icon}
      label="Tendência de Eficiência"
      value={wasteTrendLabel}
      subtitle={
        <div>
          <span>Baseado no histórico recente — sem previsão</span>
          <BenchmarkBadge benchmark={wasteBenchmark} />
        </div>
      }
    />
  );
}
