import { StatusBadge } from "@/components/shared/StatusBadge";
import type { MetricExplanationViewModel } from "@/features/explainability/explainability.mapper";
import { Lightbulb } from "lucide-react";

type ForecastExplanationCardProps = {
  explanation: MetricExplanationViewModel;
};

export function ForecastExplanationCard({ explanation }: ForecastExplanationCardProps) {
  return (
    <div className="mt-6 space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="flex items-start gap-2">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand-accent" />
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-foreground">{explanation.summary}</p>
          {explanation.mainDriver ? (
            <div className="rounded-md border border-border/60 bg-background px-3 py-2">
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
            <ul className="space-y-2 text-sm text-muted-foreground">
              {explanation.factors.map((factor) => (
                <li key={factor.code}>{factor.label}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
