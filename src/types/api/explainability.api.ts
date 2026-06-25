export type ExplanationSeverity = "POSITIVE" | "NEUTRAL" | "WARNING" | "CRITICAL";

export type ExplanationFactorDto = {
  code: string;
  label: string;
  contribution: number | null;
  severity: ExplanationSeverity;
};

export type MetricExplanationDto = {
  summary: string;
  mainDriver: ExplanationFactorDto | null;
  factors: ExplanationFactorDto[];
};

export type PortfolioExplanationDto = {
  summary: string;
  mainDriver: string | null;
  strengths: string[];
  risks: string[];
};
