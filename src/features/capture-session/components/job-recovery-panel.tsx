"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { describeJobRecovery } from "@/features/capture-session/job-recovery";
import { recoverJob } from "@/services/jobs.service";
import { ApiError } from "@/types/api/common.api";
import type {
  JobStatusDto,
  ProcessingJobDetailResponseDto,
  ProcessingJobRecoveryFieldsDto,
} from "@/types/api/processing.api";

type JobRecoveryPanelProps = {
  job: { jobId: string; status: JobStatusDto } & ProcessingJobRecoveryFieldsDto;
  onRecovered: (job: ProcessingJobDetailResponseDto) => void;
};

const FORBIDDEN_MESSAGE = "Você não tem permissão para recuperar este processamento.";
const UNEXPECTED_MESSAGE = "Não foi possível recuperar o processamento. Tente novamente.";

function recoveryErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status === 403 ? FORBIDDEN_MESSAGE : error.message;
  }
  return UNEXPECTED_MESSAGE;
}

export function JobRecoveryPanel({ job, onRecovered }: JobRecoveryPanelProps) {
  const submitting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recovery = describeJobRecovery(job);

  if (!recovery.canRecover) {
    return null;
  }

  async function handleRecover() {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const recovered = await recoverJob(job.jobId);
      onRecovered(recovered);
    } catch (caught) {
      setError(recoveryErrorMessage(caught));
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm"
      data-testid="job-recovery-panel"
    >
      <p className="font-medium">{recovery.causeLabel}</p>
      <p className="text-xs text-muted-foreground">{recovery.causeDescription}</p>
      <Button
        type="button"
        size="sm"
        onClick={handleRecover}
        disabled={isSubmitting}
      >
        Recuperar processamento
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
