import type { StatusVariant } from "@/features/domain/models/capture-session";
import type { ChangeSummary } from "@/features/temporal-comparison/analytics/change-analytics";

const SUMMARY_MESSAGES: Record<ChangeSummary, string> = {
  EXPANDED_COVERAGE:
    "A área monitorada aumentou em relação ao levantamento anterior.",
  REDUCED_COVERAGE:
    "A área monitorada diminuiu em relação ao levantamento anterior.",
  NO_SIGNIFICANT_CHANGE:
    "Não foram identificadas mudanças relevantes na área monitorada.",
  INSUFFICIENT_DATA: "Não há dados suficientes para análise.",
};

const SUMMARY_LABELS: Record<ChangeSummary, string> = {
  EXPANDED_COVERAGE: "Cobertura expandida",
  REDUCED_COVERAGE: "Cobertura reduzida",
  NO_SIGNIFICANT_CHANGE: "Sem mudança relevante",
  INSUFFICIENT_DATA: "Dados insuficientes",
};

const SUMMARY_VARIANTS: Record<ChangeSummary, StatusVariant> = {
  EXPANDED_COVERAGE: "success",
  REDUCED_COVERAGE: "warning",
  NO_SIGNIFICANT_CHANGE: "neutral",
  INSUFFICIENT_DATA: "neutral",
};

export function getChangeSummaryMessage(summary: ChangeSummary): string {
  return SUMMARY_MESSAGES[summary];
}

export function getChangeSummaryLabel(summary: ChangeSummary): string {
  return SUMMARY_LABELS[summary];
}

export function getChangeSummaryVariant(summary: ChangeSummary): StatusVariant {
  return SUMMARY_VARIANTS[summary];
}

/** Lower GSD (cm/pixel) means better spatial resolution. */
export function describeGsdQualityChange(gsdDelta: number | null): string {
  if (gsdDelta === null) {
    return "Resolução indisponível para comparação.";
  }
  if (gsdDelta < 0) {
    return "A resolução do levantamento melhorou (menor GSD).";
  }
  if (gsdDelta > 0) {
    return "A resolução do levantamento diminuiu (maior GSD).";
  }
  return "A resolução permaneceu estável entre os levantamentos.";
}
