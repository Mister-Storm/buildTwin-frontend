import type { StatusVariant } from "@/features/domain/models/capture-session";
import type {
  ExplanationFactorDto,
  ExplanationSeverity,
  MetricExplanationDto,
  PortfolioExplanationDto,
} from "@/types/api/explainability.api";

export type ExplanationFactorViewModel = {
  code: string;
  label: string;
  contributionLabel: string | null;
  severity: ExplanationSeverity;
  severityVariant: StatusVariant;
};

export type MetricExplanationViewModel = {
  summary: string;
  mainDriver: ExplanationFactorViewModel | null;
  factors: ExplanationFactorViewModel[];
};

export type PortfolioExplanationViewModel = {
  summary: string;
  mainDriver: string | null;
  strengths: string[];
  risks: string[];
};

export function mapExplanationSeverityVariant(
  severity: ExplanationSeverity,
): StatusVariant {
  switch (severity) {
    case "POSITIVE":
      return "success";
    case "NEUTRAL":
      return "neutral";
    case "WARNING":
      return "warning";
    case "CRITICAL":
      return "error";
  }
}

export function mapExplanationFactor(
  factor: ExplanationFactorDto,
): ExplanationFactorViewModel {
  return {
    code: factor.code,
    label: factor.label,
    contributionLabel: formatContribution(factor.contribution),
    severity: factor.severity,
    severityVariant: mapExplanationSeverityVariant(factor.severity),
  };
}

export function mapMetricExplanation(
  explanation: MetricExplanationDto,
): MetricExplanationViewModel {
  return {
    summary: explanation.summary,
    mainDriver: explanation.mainDriver
      ? mapExplanationFactor(explanation.mainDriver)
      : null,
    factors: explanation.factors.map(mapExplanationFactor),
  };
}

export function mapPortfolioExplanation(
  explanation: PortfolioExplanationDto,
): PortfolioExplanationViewModel {
  return {
    summary: explanation.summary,
    mainDriver: explanation.mainDriver,
    strengths: explanation.strengths,
    risks: explanation.risks,
  };
}

function formatContribution(value: number | null): string | null {
  if (value == null) {
    return null;
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}`;
}
