import type { StatusVariant } from "@/features/domain/models/flight";
import type {
  ConstructionForecastDto,
  ForecastConfidence,
  ScheduleRisk,
  VelocityTrend,
} from "@/features/forecast-intelligence/forecast-intelligence.api";
import { formatDate, parseDateOnly } from "@/lib/formatters";

export type ForecastIntelligenceViewModel = {
  predictedCompletionDateLabel: string;
  remainingDaysLabel: string;
  scheduleRisk: ScheduleRisk | null;
  scheduleRiskLabel: string | null;
  scheduleRiskVariant: StatusVariant | null;
  confidence: ForecastConfidence;
  confidenceLabel: string;
  confidenceVariant: StatusVariant;
  velocityTrend: VelocityTrend;
  velocityTrendLabel: string;
  velocityTrendVariant: StatusVariant;
  projectedPercentAtPlannedLabel: string;
  generatedAtLabel: string;
};

const CONFIDENCE_LABELS: Record<ForecastConfidence, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

const SCHEDULE_RISK_LABELS: Record<ScheduleRisk, string> = {
  ON_TRACK: "No prazo",
  ATTENTION: "Atenção",
  DELAY_RISK: "Risco de atraso",
  CRITICAL_DELAY: "Atraso crítico",
};

const VELOCITY_TREND_LABELS: Record<VelocityTrend, string> = {
  ACCELERATING: "Acelerando",
  STABLE: "Estável",
  DECELERATING: "Desacelerando",
  INSUFFICIENT_DATA: "Dados insuficientes",
};

export function mapForecastConfidenceVariant(
  confidence: ForecastConfidence,
): StatusVariant {
  switch (confidence) {
    case "HIGH":
      return "success";
    case "MEDIUM":
      return "info";
    case "LOW":
      return "warning";
  }
}

export function mapScheduleRiskVariant(risk: ScheduleRisk): StatusVariant {
  switch (risk) {
    case "ON_TRACK":
      return "success";
    case "ATTENTION":
      return "info";
    case "DELAY_RISK":
      return "warning";
    case "CRITICAL_DELAY":
      return "error";
  }
}

export function mapVelocityTrendVariant(trend: VelocityTrend): StatusVariant {
  switch (trend) {
    case "ACCELERATING":
      return "success";
    case "STABLE":
      return "info";
    case "DECELERATING":
      return "warning";
    case "INSUFFICIENT_DATA":
      return "warning";
  }
}

export function mapForecastIntelligenceViewModel(
  dto: ConstructionForecastDto,
): ForecastIntelligenceViewModel {
  return {
    predictedCompletionDateLabel: formatForecastDate(dto.predictedCompletionDate),
    remainingDaysLabel: formatRemainingDays(dto.remainingDays),
    scheduleRisk: dto.scheduleRisk,
    scheduleRiskLabel: dto.scheduleRisk ? SCHEDULE_RISK_LABELS[dto.scheduleRisk] : null,
    scheduleRiskVariant: dto.scheduleRisk
      ? mapScheduleRiskVariant(dto.scheduleRisk)
      : null,
    confidence: dto.confidence,
    confidenceLabel: CONFIDENCE_LABELS[dto.confidence],
    confidenceVariant: mapForecastConfidenceVariant(dto.confidence),
    velocityTrend: dto.velocityTrend,
    velocityTrendLabel: VELOCITY_TREND_LABELS[dto.velocityTrend],
    velocityTrendVariant: mapVelocityTrendVariant(dto.velocityTrend),
    projectedPercentAtPlannedLabel: formatProjectedPercent(
      dto.projectedCompletionPercentAtPlannedDate,
    ),
    generatedAtLabel: new Date(dto.generatedAt).toLocaleString("pt-BR"),
  };
}

function formatForecastDate(value: string | null): string {
  if (!value) {
    return "Dados insuficientes";
  }
  return formatDate(parseDateOnly(value));
}

function formatRemainingDays(value: number | null): string {
  if (value == null) {
    return "—";
  }
  return `${value} ${value === 1 ? "dia" : "dias"}`;
}

function formatProjectedPercent(value: number | null): string {
  if (value == null) {
    return "—";
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}
