"use client";

import Link from "next/link";
import { CreateCaptureSessionDialog } from "@/features/capture-session/create-capture-session-dialog";
import { ArchiveProjectDialog } from "@/features/project/archive-project-dialog";
import { GitCompareArrows, ImageIcon, TrendingUp } from "lucide-react";
import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";

type ProjectDetailActionsProps = {
  projectId: string;
  projectName: string;
  isArchived: boolean;
  latestResolution: OrthomosaicResolution | null;
  processedSurveyCount?: number;
};

export function ProjectDetailActions({
  projectId,
  projectName,
  isArchived,
  latestResolution,
  processedSurveyCount = 0,
}: ProjectDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isArchived ? (
        <>
          <CreateCaptureSessionDialog projectId={projectId} redirectToCaptureSession={false} />
          <ArchiveProjectDialog
            projectId={projectId}
            projectName={projectName}
          />
        </>
      ) : null}
      {latestResolution ? (
        <Link
          href={`/projects/${projectId}/orthomosaic?captureSessionId=${latestResolution.captureSessionId}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-accent px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <ImageIcon className="size-4" />
          Ver Ortomosaico
        </Link>
      ) : null}
      {processedSurveyCount >= 1 ? (
        <Link
          href={`/projects/${projectId}/progress`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 px-3 text-sm font-medium transition-colors hover:bg-muted/50"
        >
          <TrendingUp className="size-4" />
          Progresso da Obra
        </Link>
      ) : null}
      {processedSurveyCount >= 2 ? (
        <Link
          href={`/projects/${projectId}/compare`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 px-3 text-sm font-medium transition-colors hover:bg-muted/50"
        >
          <GitCompareArrows className="size-4" />
          Comparar levantamentos
        </Link>
      ) : null}
    </div>
  );
}
