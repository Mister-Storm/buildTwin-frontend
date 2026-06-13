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
};

export function buildProcessingSteps(
  imageCount: number,
  jobStatus: JobStatusDto | null,
): ProcessingStep[] {
  const hasJob =
    jobStatus === "PENDING" ||
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
    },
    {
      id: "processing",
      label: "Processando imagens",
      completed: jobStatus === "RUNNING" || jobStatus === "COMPLETED",
    },
    {
      id: "result",
      label: "Gerando resultado",
      completed: jobStatus === "COMPLETED",
    },
  ];
}
