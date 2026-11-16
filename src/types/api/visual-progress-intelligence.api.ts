export type ProgressClassificationDto = "LOW" | "MEDIUM" | "HIGH";

export type TrendDto = "UNKNOWN" | "STABLE";

export type VisualEvidenceStatusDto = "AVAILABLE" | "INCONCLUSIVE" | "UNAVAILABLE";

export type VisualProgressIntelligenceDto = {
  captureSessionA: string;
  captureSessionB: string;
  changePercentage: number | null;
  deltaDays: number;
  averageDailyChange: number | null;
  classification: ProgressClassificationDto;
  confidenceScore: number | null;
  trend: TrendDto;
  evidenceStatus: VisualEvidenceStatusDto;
  unavailableReason: string | null;
};
