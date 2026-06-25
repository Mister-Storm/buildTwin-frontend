import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectRankingRowViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";

type TopHealthyProjectsSectionProps = {
  projects: ProjectRankingRowViewModel[];
};

export function TopHealthyProjectsSection({ projects }: TopHealthyProjectsSectionProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Top 5 — Saúde da obra</CardTitle>
        <CardDescription>Projetos com maior índice de saúde da construção.</CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma obra ativa no portfólio.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {projects.map((project) => (
              <li key={project.projectId} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-accent/10 text-sm font-semibold text-brand-accent">
                    {project.rank}
                  </span>
                  <Link
                    href={project.href}
                    className="font-medium hover:text-brand-accent hover:underline"
                  >
                    {project.projectName}
                  </Link>
                </div>
                <span className="text-sm text-muted-foreground">{project.metricLabel}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
