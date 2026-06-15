import { describe, expect, it } from "vitest";
import { calculateProgressMetrics } from "@/features/progress-intelligence/progress-metrics";
import { parseDateOnly } from "@/lib/formatters";

describe("calculateProgressMetrics", () => {
  it("computes positive growth metrics", () => {
    const metrics = calculateProgressMetrics(
      7250,
      8441,
      parseDateOnly("2026-05-01"),
      parseDateOnly("2026-06-15"),
    );

    expect(metrics.areaDelta).toBe(1191);
    expect(metrics.areaDeltaPercent).toBeCloseTo(16.4276, 3);
    expect(metrics.daysBetween).toBe(45);
    expect(metrics.growthPerDay).toBeCloseTo(26.4667, 3);
  });

  it("computes negative growth metrics", () => {
    const metrics = calculateProgressMetrics(
      9000,
      8000,
      parseDateOnly("2026-05-01"),
      parseDateOnly("2026-06-01"),
    );

    expect(metrics.areaDelta).toBe(-1000);
    expect(metrics.areaDeltaPercent).toBeCloseTo(-11.1111, 3);
    expect(metrics.daysBetween).toBe(31);
    expect(metrics.growthPerDay).toBeCloseTo(-32.2581, 3);
  });

  it("returns null area metrics when areas are missing", () => {
    const metrics = calculateProgressMetrics(
      null,
      8000,
      parseDateOnly("2026-05-01"),
      parseDateOnly("2026-06-01"),
    );

    expect(metrics.areaDelta).toBeNull();
    expect(metrics.areaDeltaPercent).toBeNull();
    expect(metrics.growthPerDay).toBeNull();
    expect(metrics.daysBetween).toBe(31);
  });

  it("returns zero days and null growth rate for same date", () => {
    const date = parseDateOnly("2026-06-01");
    const metrics = calculateProgressMetrics(8000, 9000, date, date);

    expect(metrics.daysBetween).toBe(0);
    expect(metrics.areaDelta).toBe(1000);
    expect(metrics.growthPerDay).toBeNull();
  });

  it("avoids division by zero when previous area is zero", () => {
    const metrics = calculateProgressMetrics(
      0,
      500,
      parseDateOnly("2026-05-01"),
      parseDateOnly("2026-06-01"),
    );

    expect(metrics.areaDelta).toBe(500);
    expect(metrics.areaDeltaPercent).toBeNull();
    expect(metrics.growthPerDay).toBeCloseTo(16.129, 2);
  });
});
