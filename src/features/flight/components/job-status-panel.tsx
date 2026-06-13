"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProcessingStepsBar } from "@/features/flight/components/processing-steps-bar";
import {
  buildProcessingSteps,
  jobStatusFriendlyMessage,
} from "@/features/flight/job-status-utils";
import { formatDateTime, jobStatusVariant } from "@/lib/formatters";
import type { LatestFlightJobResponseDto } from "@/types/api/processing.api";

type JobStatusPanelProps = {
  imageCount: number;
  job: LatestFlightJobResponseDto | null;
  isPolling?: boolean;
  error?: string | null;
};

export function JobStatusPanel({
  imageCount,
  job,
  isPolling = false,
  error,
}: JobStatusPanelProps) {
  const steps = buildProcessingSteps(imageCount, job?.status ?? null);

  return (
    <Card className="border-border/60" id="job-status-panel">
      <CardHeader>
        <CardTitle className="text-lg">Monitoramento</CardTitle>
        <CardDescription>
          Acompanhe o processamento do ortomosaico em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {job ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge
                label={jobStatusFriendlyMessage(job.status)}
                variant={jobStatusVariant(job.status)}
              />
            </div>
            {job.startedAt ? (
              <p className="text-sm text-muted-foreground">
                Início: {formatDateTime(new Date(job.startedAt))}
              </p>
            ) : null}
            {job.completedAt ? (
              <p className="text-sm text-muted-foreground">
                Conclusão: {formatDateTime(new Date(job.completedAt))}
              </p>
            ) : null}
            {job.status === "FAILED" && job.failureReason ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {job.failureReason}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum processamento iniciado para este voo.
          </p>
        )}

        <ProcessingStepsBar steps={steps} />

        {isPolling ? (
          <p className="text-xs text-muted-foreground">
            Atualizando a cada 5 segundos...
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
