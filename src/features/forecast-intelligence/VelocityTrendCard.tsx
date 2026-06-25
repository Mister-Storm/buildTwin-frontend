import { ArrowDownRight, ArrowRight, ArrowUpRight, HelpCircle } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import type { VelocityTrend } from "@/features/forecast-intelligence/forecast-intelligence.api";

type VelocityTrendCardProps = {
  velocityTrend: VelocityTrend;
  velocityTrendLabel: string;
};

export function VelocityTrendCard({
  velocityTrend,
  velocityTrendLabel,
}: VelocityTrendCardProps) {
  const Icon =
    velocityTrend === "ACCELERATING"
      ? ArrowUpRight
      : velocityTrend === "DECELERATING"
        ? ArrowDownRight
        : velocityTrend === "STABLE"
          ? ArrowRight
          : HelpCircle;

  return (
    <MetricCard
      icon={Icon}
      label="Tendência de Velocidade"
      value={velocityTrendLabel}
      subtitle="Projeção linear — não é recomendação"
    />
  );
}
