import { ArrowDownRight, ArrowRight, ArrowUpRight, HelpCircle } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import type { TrendDirection } from "@/features/executive-intelligence/executive-intelligence.api";

type WasteTrendCardProps = {
  wasteTrend: TrendDirection;
  wasteTrendLabel: string;
};

export function WasteTrendCard({ wasteTrend, wasteTrendLabel }: WasteTrendCardProps) {
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
      subtitle="Baseado no histórico recente — sem previsão"
    />
  );
}
