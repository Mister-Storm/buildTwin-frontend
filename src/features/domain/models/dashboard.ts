export type ExecutiveMetric = {
  label: string;
  value: string;
  subtitle?: string | undefined;
  trend?: string | undefined;
};

export type ExecutiveDashboard = {
  activeProjects: ExecutiveMetric;
  lastFlight: ExecutiveMetric;
  processedFlights: ExecutiveMetric;
  completedProcessings: ExecutiveMetric;
  isUnavailable: boolean;
};

export const UNAVAILABLE_EXECUTIVE_DASHBOARD: ExecutiveDashboard = {
  activeProjects: {
    label: "Obras Ativas",
    value: "—",
    subtitle: "Backend indisponível",
  },
  lastFlight: {
    label: "Último Voo Realizado",
    value: "—",
    subtitle: "Backend indisponível",
  },
  processedFlights: {
    label: "Voos Processados",
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
