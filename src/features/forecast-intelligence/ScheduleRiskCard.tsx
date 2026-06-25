import { AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusVariant } from "@/features/domain/models/flight";

type ScheduleRiskCardProps = {
  scheduleRiskLabel: string | null;
  scheduleRiskVariant: StatusVariant | null;
  projectedPercentAtPlannedLabel: string;
};

export function ScheduleRiskCard({
  scheduleRiskLabel,
  scheduleRiskVariant,
  projectedPercentAtPlannedLabel,
}: ScheduleRiskCardProps) {
  return (
    <MetricCard
      icon={AlertTriangle}
      label="Risco de Cronograma"
      value={projectedPercentAtPlannedLabel}
      subtitle={
        scheduleRiskLabel && scheduleRiskVariant ? (
          <StatusBadge label={scheduleRiskLabel} variant={scheduleRiskVariant} />
        ) : (
          "Informe a data prevista de conclusão no planejamento"
        )
      }
    />
  );
}
