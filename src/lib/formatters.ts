import type { StatusVariant } from "@/features/domain/models/flight";

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function flightStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PROCESSING":
    case "UPLOADING":
      return "warning";
    case "FAILED":
      return "error";
    default:
      return "neutral";
  }
}

export function jobStatusVariant(status: string | null): StatusVariant {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "RUNNING":
    case "PENDING":
      return "warning";
    case "FAILED":
      return "error";
    default:
      return "neutral";
  }
}

export function flightStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    CREATED: "Criado",
    UPLOADING: "Enviando",
    PROCESSING: "Processando",
    COMPLETED: "Concluído",
    FAILED: "Falhou",
  };
  return labels[status] ?? status;
}

export function jobStatusLabel(status: string | null): string {
  if (!status) return "Sem processamento";
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    RUNNING: "Em execução",
    COMPLETED: "Concluído",
    FAILED: "Falhou",
  };
  return labels[status] ?? status;
}

export function projectStatusLabel(archived: boolean): string {
  return archived ? "Arquivada" : "Ativa";
}
