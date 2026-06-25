import { TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";

type VelocityCardProps = {
  builtAreaVelocityLabel: string;
  floorVelocityLabel: string;
};

export function VelocityCard({
  builtAreaVelocityLabel,
  floorVelocityLabel,
}: VelocityCardProps) {
  return (
    <MetricCard
      icon={TrendingUp}
      label="Velocidade de Construção"
      value={builtAreaVelocityLabel}
      subtitle={floorVelocityLabel}
    />
  );
}
