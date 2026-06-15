import Link from "next/link";
import type { TimelineItemViewModel } from "@/features/domain/models/temporal-comparison";
import {
  enrichTimelineWithEvolution,
  formatSignedArea,
  formatSignedPercent,
  resolveDeltaDirection,
} from "@/features/temporal-comparison/analytics/change-analytics";
import { DeltaIndicator } from "@/features/temporal-comparison/analytics/DeltaIndicator";
import { ImageIcon } from "lucide-react";

type ProcessedSurveyTimelineProps = {
  projectId: string;
  items: TimelineItemViewModel[];
};

export function ProcessedSurveyTimeline({
  projectId,
  items,
}: ProcessedSurveyTimelineProps) {
  if (items.length === 0) {
    return null;
  }

  const enriched = enrichTimelineWithEvolution(items);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="space-y-4">
        {enriched.map((item, index) => {
          const previous = index > 0 ? enriched[index - 1]! : null;
          const compareHref =
            previous !== null
              ? `/projects/${projectId}/compare?flightA=${previous.flightId}&flightB=${item.flightId}`
              : null;

          return (
            <div
              key={item.flightId}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-accent/40 bg-brand-accent/10 text-brand-accent">
                  <ImageIcon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Levantamento {item.sequenceNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.flightDateLabel} · {item.operatorName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {item.evolution ? (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DeltaIndicator
                      direction={resolveDeltaDirection(item.evolution.areaDelta)}
                    />
                    {item.evolution.areaDeltaPercent !== null ? (
                      <span>
                        {formatSignedPercent(item.evolution.areaDeltaPercent)}
                      </span>
                    ) : null}
                    {item.evolution.areaDelta !== null ? (
                      <span className="text-muted-foreground">
                        {formatSignedArea(item.evolution.areaDelta)}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Baseline</span>
                )}
                {compareHref ? (
                  <Link
                    href={compareHref}
                    className="text-xs font-medium text-brand-accent hover:underline"
                  >
                    Comparar
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
