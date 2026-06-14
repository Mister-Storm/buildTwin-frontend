import type { StatusVariant } from "@/features/domain/models/flight";

/** Parses API date-only strings (YYYY-MM-DD) as local calendar dates. */
export function parseDateOnly(dateString: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    throw new Error(`Invalid date-only string: ${dateString}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

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
