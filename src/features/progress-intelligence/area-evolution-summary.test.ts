import { describe, expect, it } from "vitest";
import { buildAreaEvolutionSummary } from "@/features/progress-intelligence/area-evolution-summary";
import type { AreaEvolutionMetrics } from "@/features/progress-intelligence/area-evolution-metrics";

describe("buildAreaEvolutionSummary", () => {
  it("builds growth summary lines", () => {
    const metrics: AreaEvolutionMetrics = {
      areaDelta: 1191,
      areaDeltaPercent: 16.4,
      daysBetween: 45,
      growthPerDay: 26.5,
    };

    expect(buildAreaEvolutionSummary(metrics)).toEqual([
      "Crescimento de 16,4% entre os levantamentos.",
      "Evolução média de 26,5 m²/dia.",
    ]);
  });

  it("returns insufficient data message when percent is unavailable", () => {
    const metrics: AreaEvolutionMetrics = {
      areaDelta: null,
      areaDeltaPercent: null,
      daysBetween: 10,
      growthPerDay: null,
    };

    expect(buildAreaEvolutionSummary(metrics)).toEqual([
      "Dados insuficientes para calcular evolução.",
    ]);
  });
});
