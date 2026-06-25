"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MetricExplanationViewModel } from "@/features/explainability/explainability.mapper";
import { HelpCircle } from "lucide-react";

type AttentionExplanationPopoverProps = {
  explanation: MetricExplanationViewModel;
};

export function AttentionExplanationPopover({
  explanation,
}: AttentionExplanationPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Ver explicação da atenção executiva"
      >
        <HelpCircle className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <p className="text-sm leading-relaxed">{explanation.summary}</p>
        {explanation.mainDriver ? (
          <div className="mt-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Principal fator
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{explanation.mainDriver.label}</p>
              <StatusBadge
                label={explanation.mainDriver.severity}
                variant={explanation.mainDriver.severityVariant}
              />
            </div>
          </div>
        ) : null}
        {explanation.factors.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {explanation.factors.map((factor) => (
              <li key={factor.code} className="flex items-start justify-between gap-3">
                <span>{factor.label}</span>
                {factor.contributionLabel ? (
                  <span className="shrink-0 font-mono text-xs">{factor.contributionLabel}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
