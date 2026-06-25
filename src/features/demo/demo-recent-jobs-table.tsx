import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, jobStatusLabel, jobStatusVariant } from "@/lib/formatters";
import type { RecentJobSummaryDto } from "@/types/api/system.api";
import type { JobStatusDto } from "@/types/api/processing.api";

type DemoRecentJobsTableProps = {
  jobs: RecentJobSummaryDto[];
};

function mapJobStatus(status: string): JobStatusDto | null {
  if (
    status === "PENDING" ||
    status === "RUNNING" ||
    status === "COMPLETED" ||
    status === "FAILED"
  ) {
    return status;
  }
  return null;
}

export function DemoRecentJobsTable({ jobs }: DemoRecentJobsTableProps) {
  if (jobs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum processamento registrado ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-sm">
        <thead className="border-b border-border/60 bg-muted/40 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Obra</th>
            <th className="px-4 py-3 font-medium">Voo</th>
            <th className="px-4 py-3 font-medium">Operador</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const mappedStatus = mapJobStatus(job.status);
            return (
              <tr
                key={`${job.captureSessionId}-${job.jobId ?? "none"}`}
                className="border-b border-border/40 last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${job.projectId}`}
                    className="font-medium hover:text-brand-accent"
                  >
                    {job.projectName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${job.projectId}/capture-sessions/${job.captureSessionId}`}
                    className="hover:text-brand-accent"
                  >
                    {formatDate(new Date(job.captureDate))}
                  </Link>
                </td>
                <td className="px-4 py-3">{job.operatorName}</td>
                <td className="px-4 py-3">
                  {mappedStatus ? (
                    <StatusBadge
                      label={jobStatusLabel(mappedStatus)}
                      variant={jobStatusVariant(mappedStatus)}
                    />
                  ) : (
                    <StatusBadge label="Sem job" variant="neutral" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
