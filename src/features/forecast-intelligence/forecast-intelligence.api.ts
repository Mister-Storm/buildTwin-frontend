export type ForecastConfidence = "HIGH" | "MEDIUM" | "LOW";

export type ScheduleRisk =
  | "ON_TRACK"
  | "ATTENTION"
  | "DELAY_RISK"
  | "CRITICAL_DELAY";

export type VelocityTrend =
  | "ACCELERATING"
  | "STABLE"
  | "DECELERATING"
  | "INSUFFICIENT_DATA";

export type ConstructionForecastDto = {
  projectId: string;
  estimatedCompletionDate: string | null;
  remainingDays: number | null;
  projectedCompletionPercentAtPlannedDate: number | null;
  predictedCompletionDate: string | null;
  scheduleRisk: ScheduleRisk | null;
  confidence: ForecastConfidence;
  averageBuiltAreaVelocity: number | null;
  averageFloorVelocity: number | null;
  velocityTrend: VelocityTrend;
  generatedAt: string;
};
