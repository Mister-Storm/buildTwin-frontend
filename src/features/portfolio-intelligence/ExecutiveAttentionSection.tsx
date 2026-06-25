import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { AttentionProjectViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";

type ExecutiveAttentionSectionProps = {
  projects: AttentionProjectViewModel[];
};

export function ExecutiveAttentionSection({ projects }: ExecutiveAttentionSectionProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Atenção executiva</CardTitle>
        <CardDescription>
          Top 5 obras por índice de atenção executiva (0–100). Nível derivado do score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma obra requer atenção imediata.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {projects.map((project) => (
              <li
                key={project.projectId}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <Link
                    href={project.href}
                    className="font-medium hover:text-brand-accent hover:underline"
                  >
                    {project.projectName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Saúde: {project.constructionHealthScoreLabel}
                    {project.scheduleRiskLabel ? ` · Cronograma: ${project.scheduleRiskLabel}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{project.executiveAttentionScoreLabel}</span>
                  <StatusBadge
                    label={project.executiveAttentionLevelLabel}
                    variant={project.executiveAttentionLevelVariant}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
