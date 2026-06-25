import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PortfolioExplanationViewModel } from "@/features/explainability/explainability.mapper";
import { Lightbulb } from "lucide-react";

type PortfolioExplanationSectionProps = {
  explanation: PortfolioExplanationViewModel;
};

export function PortfolioExplanationSection({
  explanation,
}: PortfolioExplanationSectionProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="size-5 text-brand-accent" />
          Explicação do portfólio
        </CardTitle>
        <CardDescription>
          Fatores determinísticos derivados dos indicadores agregados. Não são recomendações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-foreground">{explanation.summary}</p>
        {explanation.mainDriver ? (
          <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Principal fator
            </p>
            <p className="mt-1 text-sm font-medium">{explanation.mainDriver}</p>
          </div>
        ) : null}
        {explanation.risks.length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Riscos
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {explanation.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {explanation.strengths.length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pontos fortes
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {explanation.strengths.map((strength) => (
                <li key={strength}>{strength}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
