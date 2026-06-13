"use client";

import Link from "next/link";
import { CreateFlightDialog } from "@/features/flight/create-flight-dialog";
import { ArchiveProjectDialog } from "@/features/project/archive-project-dialog";
import { ImageIcon } from "lucide-react";
import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";

type ProjectDetailActionsProps = {
  projectId: string;
  projectName: string;
  isArchived: boolean;
  latestResolution: OrthomosaicResolution | null;
};

export function ProjectDetailActions({
  projectId,
  projectName,
  isArchived,
  latestResolution,
}: ProjectDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isArchived ? (
        <>
          <CreateFlightDialog projectId={projectId} redirectToFlight={false} />
          <ArchiveProjectDialog
            projectId={projectId}
            projectName={projectName}
          />
        </>
      ) : null}
      {latestResolution ? (
        <Link
          href={`/projects/${projectId}/orthomosaic?flightId=${latestResolution.flightId}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-accent px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <ImageIcon className="size-4" />
          Ver Ortomosaico
        </Link>
      ) : null}
    </div>
  );
}
