"use client";

import type { TimelineItemViewModel } from "@/features/domain/models/temporal-comparison";
import { useRouter } from "next/navigation";

type FlightComparisonSelectorProps = {
  projectId: string;
  timeline: TimelineItemViewModel[];
  flightAId: string;
  flightBId: string;
};

export function FlightComparisonSelector({
  projectId,
  timeline,
  flightAId,
  flightBId,
}: FlightComparisonSelectorProps) {
  const router = useRouter();

  function updateSelection(nextA: string, nextB: string) {
    if (nextA === nextB) {
      return;
    }
    const params = new URLSearchParams({
      flightA: nextA,
      flightB: nextB,
    });
    router.push(`/projects/${projectId}/compare?${params.toString()}`);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2 text-sm">
        <span className="font-medium text-muted-foreground">Levantamento A (anterior)</span>
        <select
          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
          value={flightAId}
          onChange={(event) => updateSelection(event.target.value, flightBId)}
        >
          {timeline.map((item) => (
            <option key={item.flightId} value={item.flightId}>
              #{item.sequenceNumber} — {item.flightDateLabel} ({item.operatorName})
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-muted-foreground">Levantamento B (mais recente)</span>
        <select
          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
          value={flightBId}
          onChange={(event) => updateSelection(flightAId, event.target.value)}
        >
          {timeline.map((item) => (
            <option key={item.flightId} value={item.flightId}>
              #{item.sequenceNumber} — {item.flightDateLabel} ({item.operatorName})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
