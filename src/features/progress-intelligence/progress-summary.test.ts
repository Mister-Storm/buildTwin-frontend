import { describe, expect, it } from "vitest";
import { buildProgressSummary } from "@/features/progress-intelligence/progress-summary";
import type { ProgressMetrics } from "@/features/progress-intelligence/progress-metrics";

describe("buildProgressSummary", () => {
  it("describes positive growth and daily evolution", () => {
    const metrics: ProgressMetrics = {
      areaDelta: 1191,
      areaDeltaPercent: 16.4,
      daysBetween: 32,
      growthPerDay: 37.2,
    };

    expect(buildProgressSummary(metrics)).toEqual([
      "Crescimento de 16,4% entre os levantamentos.",
      "Evolução média de 37,2 m²/dia.",
    ]);
  });

  it("describes negative growth", () => {
    const metrics: ProgressMetrics = {
      areaDelta: -350,
      areaDeltaPercent: -2.1,
      daysBetween: 20,
      growthPerDay: -17.5,
    };

    expect(buildProgressSummary(metrics)[0]).toBe(
      "Redução de 2,1% entre os levantamentos.",
    );
  });

  it("returns insufficient data message when percent is unavailable", () => {
    const metrics: ProgressMetrics = {
      areaDelta: null,
      areaDeltaPercent: null,
      daysBetween: 30,
      growthPerDay: null,
    };

    expect(buildProgressSummary(metrics)).toEqual([
      "Dados insuficientes para calcular evolução.",
    ]);
  });
});
