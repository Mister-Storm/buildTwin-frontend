import type { JobStatusDto } from "@/types/api/processing.api";

export function jobStatusFriendlyMessage(status: JobStatusDto | null): string {
  switch (status) {
    case "PENDING":
      return "Aguardando processamento";
    case "RUNNING":
      return "Gerando ortomosaico";
    case "COMPLETED":
      return "Processamento concluído";
    case "FAILED":
      return "Falha no processamento";
    default:
      return "Sem processamento";
  }
}

export type ProcessingStep = {
  id: string;
  label: string;
  completed: boolean;
  timestamp?: string | null | undefined;
};

type BuildProcessingStepsInput = {
  imageCount: number;
  jobStatus: JobStatusDto | null;
  createdAt?: string | null | undefined;
  startedAt?: string | null | undefined;
  completedAt?: string | null | undefined;
};

export function buildProcessingSteps({
  imageCount,
  jobStatus,
  createdAt,
  startedAt,
  completedAt,
}: BuildProcessingStepsInput): ProcessingStep[] {
  const hasJob =
    jobStatus === "PENDING" ||
    jobStatus === "RUNNING" ||
    jobStatus === "COMPLETED" ||
    jobStatus === "FAILED";

  const isRunningOrDone =
    jobStatus === "RUNNING" ||
    jobStatus === "COMPLETED" ||
    jobStatus === "FAILED";

  return [
    {
      id: "upload",
      label: "Upload concluído",
      completed: imageCount > 0,
    },
    {
      id: "job-created",
      label: "Job criado",
      completed: hasJob,
      timestamp: createdAt,
    },
    {
      id: "worker-started",
      label: "Worker iniciou processamento",
      completed: Boolean(startedAt) || isRunningOrDone,
      timestamp: startedAt,
    },
    {
      id: "processor-received",
      label: "Processor recebeu requisição",
      completed: isRunningOrDone,
      timestamp: startedAt,
    },
    {
      id: "nodeodm-running",
      label: "NodeODM executando",
      completed: jobStatus === "RUNNING" || jobStatus === "COMPLETED",
      timestamp: startedAt,
    },
    {
      id: "artifacts-generated",
      label: "Artefatos gerados",
      completed: jobStatus === "COMPLETED",
      timestamp: completedAt,
    },
    {
      id: "completed",
      label: "Processamento concluído",
      completed: jobStatus === "COMPLETED",
      timestamp: completedAt,
    },
  ];
}
