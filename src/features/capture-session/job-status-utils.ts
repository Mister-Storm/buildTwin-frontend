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
    case "CANCELLED_RESTRICTED":
      return "Cancelado por restrição de capacidade";
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
  engineProfile?: string | null | undefined;
};

export function buildProcessingSteps({
  imageCount,
  jobStatus,
  createdAt,
  startedAt,
  completedAt,
  engineProfile,
}: BuildProcessingStepsInput): ProcessingStep[] {
  const hasJob = jobStatus !== null;
  const engineFellBack = engineProfile === "FALLBACK";

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
      label: engineFellBack
        ? "Reconstrução completa indisponível (modo simplificado)"
        : "NodeODM executando",
      completed:
        !engineFellBack &&
        (jobStatus === "RUNNING" || jobStatus === "COMPLETED"),
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
