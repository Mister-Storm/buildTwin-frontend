import { CalendarClock } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";

type PredictedCompletionCardProps = {
  predictedCompletionDateLabel: string;
  remainingDaysLabel: string;
};

export function PredictedCompletionCard({
  predictedCompletionDateLabel,
  remainingDaysLabel,
}: PredictedCompletionCardProps) {
  return (
    <MetricCard
      icon={CalendarClock}
      label="Conclusão Prevista"
      value={predictedCompletionDateLabel}
      subtitle={`Restante: ${remainingDaysLabel}`}
    />
  );
}
