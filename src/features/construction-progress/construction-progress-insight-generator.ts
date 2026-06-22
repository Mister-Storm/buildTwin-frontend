import type { ConstructionProgressSnapshotViewModel } from "@/features/construction-progress/construction-progress.mapper";

const SIGNIFICANT_VISUAL_CHANGE_THRESHOLD = 20;
const STABLE_FOOTPRINT_THRESHOLD = 0.05;

export function generateConstructionProgressInsights(
  timeline: ConstructionProgressSnapshotViewModel[],
): string[] {
  const insights: string[] = [];
  const latest = timeline.at(-1);
  if (!latest) {
    return insights;
  }

  if (
    latest.visualChangeIndex !== null &&
    latest.visualChangeIndex >= SIGNIFICANT_VISUAL_CHANGE_THRESHOLD
  ) {
    insights.push(
      "Alterações significativas no terreno foram detectadas desde o levantamento anterior.",
    );
  }

  const recentFootprints = timeline
    .slice(-3)
    .map((snapshot) => snapshot.footprintIndex)
    .filter((value): value is number => value !== null);

  if (
    recentFootprints.length === 3 &&
    Math.max(...recentFootprints) - Math.min(...recentFootprints) < STABLE_FOOTPRINT_THRESHOLD
  ) {
    insights.push("A ocupação do terreno permaneceu estável nos levantamentos recentes.");
  }

  const recentVisualChanges = timeline
    .slice(-3)
    .map((snapshot) => snapshot.visualChangeIndex)
    .filter((value): value is number => value !== null);

  if (
    recentVisualChanges.length >= 2 &&
    recentVisualChanges.every(
      (value, index, values) => index === 0 || value < values[index - 1]!,
    )
  ) {
    insights.push("A atividade de alteração visual parece estar desacelerando.");
  }

  return insights;
}
