export type AreaEvolutionMetrics = {
  areaDelta: number | null;
  areaDeltaPercent: number | null;
  daysBetween: number | null;
  growthPerDay: number | null;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function calculateAreaEvolutionMetrics(
  previousArea: number | null | undefined,
  currentArea: number | null | undefined,
  previousDate: Date,
  currentDate: Date,
): AreaEvolutionMetrics {
  const daysBetween = Math.round(
    (currentDate.getTime() - previousDate.getTime()) / MS_PER_DAY,
  );

  const previous = previousArea ?? null;
  const current = currentArea ?? null;

  if (previous === null || current === null) {
    return {
      areaDelta: null,
      areaDeltaPercent: null,
      daysBetween,
      growthPerDay: null,
    };
  }

  const areaDelta = current - previous;
  const areaDeltaPercent = previous === 0 ? null : (areaDelta / previous) * 100;
  const growthPerDay = daysBetween > 0 ? areaDelta / daysBetween : null;

  return {
    areaDelta,
    areaDeltaPercent,
    daysBetween,
    growthPerDay,
  };
}
