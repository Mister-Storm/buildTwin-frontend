import type { StatusVariant } from "@/features/domain/models/capture-session";

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

export function formatAreaDelta(delta: number | null): string {
  if (delta === null) {
    return "Não disponível";
  }
  const formatted = Math.abs(delta).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${formatted} m²`;
}

export function formatPercent(percent: number | null): string {
  if (percent === null) {
    return "Não disponível";
  }
  const formatted = Math.abs(percent).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const sign = percent > 0 ? "+" : percent < 0 ? "−" : "";
  return `${sign}${formatted}%`;
}

export function formatAbsolutePercent(percent: number | null): string {
  if (percent === null) {
    return "Não disponível";
  }
  const formatted = Math.abs(percent).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${formatted}%`;
}

export function formatGrowthRate(rate: number | null): string {
  if (rate === null) {
    return "Não disponível";
  }
  const formatted = Math.abs(rate).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const sign = rate < 0 ? "−" : "";
  return `${sign}${formatted} m²/dia`;
}

export function formatIntervalDays(days: number): string {
  if (days <= 0) {
    return "0 dias";
  }
  return days === 1 ? "1 dia" : `${days} dias`;
}
