import { describeJobStages } from "@/features/capture-session/job-recovery";
import type { ProcessingJobRecoveryFieldsDto } from "@/types/api/processing.api";

type JobStageListProps = {
  job: ProcessingJobRecoveryFieldsDto;
};

export function JobStageList({ job }: JobStageListProps) {
  const stages = describeJobStages(job);

  if (!stages.recorded) {
    return (
      <p className="text-xs text-muted-foreground" data-testid="job-stages-unrecorded">
        {stages.notice}
      </p>
    );
  }

  return (
    <ul aria-label="Etapas do processamento" className="space-y-1 text-sm">
      {stages.items.map((item) => (
        <li
          key={item.key}
          className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
        >
          <span>
            {item.label}
            {item.required ? null : (
              <span className="ml-1 text-xs text-muted-foreground">(opcional)</span>
            )}
          </span>
          <span className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
            <span
              className={item.status === "FAILED" ? "font-medium text-destructive" : undefined}
            >
              {item.statusLabel}
            </span>
            {item.profileLabel ? <span>{item.profileLabel}</span> : null}
            {item.imageCountsLabel ? <span>{item.imageCountsLabel}</span> : null}
            {item.failureCode ? <span>{item.failureCode}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
