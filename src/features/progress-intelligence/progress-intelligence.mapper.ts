import type {
  ProgressClassificationDto,
  VisualProgressIntelligenceDto,
} from "@/types/api/visual-progress-intelligence.api";

export type ProgressIntelligenceViewModel = {
  flightAId: string;
  flightBId: string;
  changePercentageLabel: string;
  classification: ProgressClassificationDto;
  classificationLabel: string;
  averageDailyChangeLabel: string;
  periodLabel: string;
};

export function mapProgressIntelligence(
  dto: VisualProgressIntelligenceDto,
): ProgressIntelligenceViewModel {
  return {
    flightAId: dto.flightA,
    flightBId: dto.flightB,
    changePercentageLabel: formatChangePercentage(dto.changePercentage),
    classification: dto.classification,
    classificationLabel: dto.classification,
    averageDailyChangeLabel: formatDailyChangePercent(dto.averageDailyChange),
    periodLabel: formatPeriodDays(dto.deltaDays),
  };
}

function formatChangePercentage(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatDailyChangePercent(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}% ao dia`;
}

function formatPeriodDays(days: number): string {
  if (days <= 0) {
    return "0 dias";
  }
  return days === 1 ? "1 dia" : `${days} dias`;
}
