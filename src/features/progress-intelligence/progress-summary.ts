import type { ProgressMetrics } from "@/features/progress-intelligence/progress-metrics";
import { formatGrowthRate, formatPercent } from "@/lib/formatters";

export function buildProgressSummary(metrics: ProgressMetrics): string[] {
  if (metrics.areaDeltaPercent === null) {
    return ["Dados insuficientes para calcular evolução."];
  }

  const lines: string[] = [];

  if (metrics.areaDeltaPercent > 0) {
    lines.push(
      `Crescimento de ${stripSign(formatPercent(metrics.areaDeltaPercent))} entre os levantamentos.`,
    );
  } else if (metrics.areaDeltaPercent < 0) {
    lines.push(
      `Redução de ${stripSign(formatPercent(metrics.areaDeltaPercent))} entre os levantamentos.`,
    );
  } else {
    lines.push("Sem alteração percentual entre os levantamentos.");
  }

  if (metrics.growthPerDay !== null) {
    lines.push(`Evolução média de ${formatGrowthRate(metrics.growthPerDay)}.`);
  }

  return lines;
}

function stripSign(value: string): string {
  return value.replace(/^[+−]/, "");
}
