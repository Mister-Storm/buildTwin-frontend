import Link from "next/link";
import type { ProjectSummary } from "@/features/domain/models/project";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

type ProjectCardProps = {
  project: ProjectSummary;
  className?: string;
};

export function ProjectCard({ project, className }: ProjectCardProps) {
  const statusVariant = project.status === "active" ? "success" : "neutral";

  return (
    <Link href={`/projects/${project.id}`}>
      <Card
        className={cn(
          "h-full border-border/60 transition-all hover:border-brand-accent/40 hover:shadow-md",
          className,
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <StatusBadge label={project.statusLabel} variant={statusVariant} />
          </div>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {project.locationLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Início: {formatDate(project.startDate)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
