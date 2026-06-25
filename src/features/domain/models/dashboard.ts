export type ExecutiveMetric = {
  label: string;
  value: string;
  subtitle?: string | undefined;
  trend?: string | undefined;
};

export type ExecutiveDashboard = {
  activeProjects: ExecutiveMetric;
  lastCaptureSession: ExecutiveMetric;
  processedCaptureSessions: ExecutiveMetric;
  completedProcessings: ExecutiveMetric;
  isUnavailable: boolean;
};

export const UNAVAILABLE_EXECUTIVE_DASHBOARD: ExecutiveDashboard = {
  activeProjects: {
    label: "Obras Ativas",
    value: "—",
    subtitle: "Backend indisponível",
  },
  lastCaptureSession: {
    label: "Última Captura Realizado",
    value: "—",
    subtitle: "Backend indisponível",
  },
  processedCaptureSessions: {
    label: "Capturas Processadas",
    value: "—",
    subtitle: "Backend indisponível",
  },
  completedProcessings: {
    label: "Processamentos Concluídos",
    value: "—",
    subtitle: "Backend indisponível",
  },
  isUnavailable: true,
};
