export type ProgressClassificationDto = "LOW" | "MEDIUM" | "HIGH";

export type TrendDto = "UNKNOWN" | "STABLE";

export type ProjectProgressDto = {
  flightA: string;
  flightB: string;
  changePercentage: number;
  deltaDays: number;
  averageDailyChange: number;
  classification: ProgressClassificationDto;
  confidenceScore: number;
  trend: TrendDto;
};
