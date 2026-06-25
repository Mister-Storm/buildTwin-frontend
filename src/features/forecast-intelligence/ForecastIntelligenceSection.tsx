import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForecastConfidenceCard } from "@/features/forecast-intelligence/ForecastConfidenceCard";
import type { ForecastIntelligenceViewModel } from "@/features/forecast-intelligence/forecast-intelligence.mapper";
import { PredictedCompletionCard } from "@/features/forecast-intelligence/PredictedCompletionCard";
import { ScheduleRiskCard } from "@/features/forecast-intelligence/ScheduleRiskCard";
import { VelocityTrendCard } from "@/features/forecast-intelligence/VelocityTrendCard";

type ForecastIntelligenceSectionProps = {
  viewModel: ForecastIntelligenceViewModel;
};

export function ForecastIntelligenceSection({
  viewModel,
}: ForecastIntelligenceSectionProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Inteligência Preditiva</CardTitle>
        <CardDescription>
          Projeção determinística de conclusão com base na velocidade histórica. Atualizado em{" "}
          {viewModel.generatedAtLabel}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PredictedCompletionCard
            predictedCompletionDateLabel={viewModel.predictedCompletionDateLabel}
            remainingDaysLabel={viewModel.remainingDaysLabel}
          />
          <ScheduleRiskCard
            scheduleRiskLabel={viewModel.scheduleRiskLabel}
            scheduleRiskVariant={viewModel.scheduleRiskVariant}
            projectedPercentAtPlannedLabel={viewModel.projectedPercentAtPlannedLabel}
          />
          <ForecastConfidenceCard viewModel={viewModel} />
          <VelocityTrendCard
            velocityTrend={viewModel.velocityTrend}
            velocityTrendLabel={viewModel.velocityTrendLabel}
          />
        </div>
      </CardContent>
    </Card>
  );
}
