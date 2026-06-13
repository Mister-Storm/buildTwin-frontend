import { Check, Circle } from "lucide-react";
import type { ProcessingStep } from "@/features/flight/job-status-utils";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type ProcessingStepsBarProps = {
  steps: ProcessingStep[];
};

export function ProcessingStepsBar({ steps }: ProcessingStepsBarProps) {
  return (
    <ol className="space-y-3">
      {steps.map((step) => (
        <li key={step.id} className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border",
              step.completed
                ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                : "border-border text-muted-foreground",
            )}
          >
            {step.completed ? (
              <Check className="size-3.5" />
            ) : (
              <Circle className="size-3" />
            )}
          </span>
          <div className="min-w-0">
            <span
              className={cn(
                "text-sm",
                step.completed ? "font-medium" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            {step.timestamp ? (
              <p className="text-xs text-muted-foreground">
                {formatDateTime(new Date(step.timestamp))}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
