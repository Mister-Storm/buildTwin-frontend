"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProcessingStepsBar } from "@/features/capture-session/components/processing-steps-bar";
import {
  buildProcessingSteps,
  jobStatusFriendlyMessage,
} from "@/features/capture-session/job-status-utils";
import { mapFailureReasonToFriendlyMessage } from "@/features/system/failure-reason-mapper";
import { formatDateTime, jobStatusVariant } from "@/lib/formatters";
import type { LatestCaptureSessionJobResponseDto } from "@/types/api/processing.api";

type JobStatusPanelProps = {
  imageCount: number;
  job: LatestCaptureSessionJobResponseDto | null;
  isPolling?: boolean;
  error?: string | null;
};

export function JobStatusPanel({
  imageCount,
  job,
  isPolling = false,
  error,
}: JobStatusPanelProps) {
  const steps = buildProcessingSteps({
    imageCount,
    jobStatus: job?.status ?? null,
    createdAt: job?.createdAt,
    startedAt: job?.startedAt,
    completedAt: job?.completedAt,
  });

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
              <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
                <p className="font-medium text-destructive">
                  {mapFailureReasonToFriendlyMessage(job.failureReason)}
                </p>
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Detalhes técnicos</summary>
                  <p className="mt-1 break-all">{job.failureReason}</p>
                </details>
                <p className="text-xs text-muted-foreground">
                  Use &quot;Reprocessar Captura&quot; acima para tentar novamente.
                </p>
              </div>
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
