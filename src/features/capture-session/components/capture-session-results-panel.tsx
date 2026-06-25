"use client";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getArtifactDownloadLink,
  getArtifactPreviewLink,
  indexArtifactsByType,
} from "@/features/capture-session/artifact-links";
import { formatDateTime } from "@/lib/formatters";
import type { ProcessingJobDetailResponseDto } from "@/types/api/processing.api";
import type { ProgressReportResponseDto } from "@/types/api/report.api";

type CaptureSessionResultsPanelProps = {
  projectId: string;
  captureSessionId: string;
  job: ProcessingJobDetailResponseDto;
  report: ProgressReportResponseDto | null;
};

export function CaptureSessionResultsPanel({
  projectId,
  captureSessionId,
  job,
  report,
}: CaptureSessionResultsPanelProps) {
  const artifacts = indexArtifactsByType(job.artifacts);
  const previewUrl = getArtifactPreviewLink(artifacts, "ORTHOMOSAIC_PREVIEW");
  const thumbnailUrl = getArtifactPreviewLink(
    artifacts,
    "ORTHOMOSAIC_THUMBNAIL",
  );

  const downloads = [
    {
      label: "Baixar Ortomosaico",
      href: getArtifactDownloadLink(artifacts, "ORTHOMOSAIC"),
    },
    {
      label: "Baixar Preview",
      href: getArtifactDownloadLink(artifacts, "ORTHOMOSAIC_PREVIEW"),
    },
    {
      label: "Baixar Thumbnail",
      href: getArtifactDownloadLink(artifacts, "ORTHOMOSAIC_THUMBNAIL"),
    },
    {
      label: "Baixar Relatório",
      href: getArtifactDownloadLink(artifacts, "REPORT"),
    },
  ].filter((d) => d.href);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Resultados</CardTitle>
        <CardDescription>
          Artefatos gerados pelo pipeline BuildTwin.
          {job.completedAt
            ? ` Processado em ${formatDateTime(new Date(job.completedAt))}.`
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_160px]">
          {previewUrl ? (
            <div className="overflow-hidden rounded-xl border border-border/60 bg-primary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview do ortomosaico"
                className="max-h-[420px] w-full object-contain p-2"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Preview do ortomosaico indisponível.
            </p>
          )}
          {thumbnailUrl ? (
            <div className="overflow-hidden rounded-xl border border-border/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        {report ? (
          <p className="text-sm text-muted-foreground">
            Relatório gerado em{" "}
            {formatDateTime(new Date(report.generatedAt))}.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {downloads.map((item) => (
            <a
              key={item.label}
              href={item.href!}
              download
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Download className="size-4" />
              {item.label}
            </a>
          ))}
          <Link
            href={`/projects/${projectId}/orthomosaic?captureSessionId=${captureSessionId}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:opacity-90"
          >
            <ExternalLink className="size-4" />
            Abrir visualizador completo
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
