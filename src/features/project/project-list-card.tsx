"use client";

import Link from "next/link";
import type { ProjectSummary } from "@/features/domain/models/project";
import { ArchiveProjectDialog } from "@/features/project/archive-project-dialog";
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

type ProjectListCardProps = {
  project: ProjectSummary;
  className?: string;
};

export function ProjectListCard({ project, className }: ProjectListCardProps) {
  const statusVariant = project.status === "active" ? "success" : "neutral";

  return (
    <Card
      className={cn(
        "flex h-full flex-col border-border/60 transition-all hover:border-brand-accent/40 hover:shadow-md",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <CardTitle className="text-lg hover:text-brand-accent">
              {project.name}
            </CardTitle>
          </Link>
          <StatusBadge label={project.statusLabel} variant={statusVariant} />
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {project.locationLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex items-end justify-between gap-2">
        <Link
          href={`/projects/${project.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Início: {formatDate(project.startDate)}
        </Link>
        {project.status === "active" ? (
          <ArchiveProjectDialog
            projectId={project.id}
            projectName={project.name}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
