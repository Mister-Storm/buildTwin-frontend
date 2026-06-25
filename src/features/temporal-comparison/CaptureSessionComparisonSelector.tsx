"use client";

import type { TimelineItemViewModel } from "@/features/domain/models/temporal-comparison";
import { useRouter } from "next/navigation";

type CaptureSessionComparisonSelectorProps = {
  projectId: string;
  timeline: TimelineItemViewModel[];
  captureSessionAId: string;
  captureSessionBId: string;
};

export function CaptureSessionComparisonSelector({
  projectId,
  timeline,
  captureSessionAId,
  captureSessionBId,
}: CaptureSessionComparisonSelectorProps) {
  const router = useRouter();

  function updateSelection(nextA: string, nextB: string) {
    if (nextA === nextB) {
      return;
    }
    const params = new URLSearchParams({
      captureSessionA: nextA,
      captureSessionB: nextB,
    });
    router.push(`/projects/${projectId}/compare?${params.toString()}`);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2 text-sm">
        <span className="font-medium text-muted-foreground">Levantamento A (anterior)</span>
        <select
          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
          value={captureSessionAId}
          onChange={(event) => updateSelection(event.target.value, captureSessionBId)}
        >
          {timeline.map((item) => (
            <option key={item.captureSessionId} value={item.captureSessionId}>
              #{item.sequenceNumber} — {item.captureDateLabel} ({item.operatorName})
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-muted-foreground">Levantamento B (mais recente)</span>
        <select
          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
          value={captureSessionBId}
          onChange={(event) => updateSelection(captureSessionAId, event.target.value)}
        >
          {timeline.map((item) => (
            <option key={item.captureSessionId} value={item.captureSessionId}>
              #{item.sequenceNumber} — {item.captureDateLabel} ({item.operatorName})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
