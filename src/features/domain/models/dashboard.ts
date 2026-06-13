export type ExecutiveMetric = {
  label: string;
  value: string;
  subtitle?: string | undefined;
  trend?: string | undefined;
};

export type ExecutiveDashboard = {
  activeProjects: ExecutiveMetric;
  lastFlight: ExecutiveMetric;
  monitoredArea: ExecutiveMetric;
  completedProcessings: ExecutiveMetric;
  isMockFallback: boolean;
};

export const MOCK_EXECUTIVE_DASHBOARD: ExecutiveDashboard = {
  activeProjects: { label: "Obras Ativas", value: "3", subtitle: "Em operação" },
  lastFlight: {
    label: "Último Voo Realizado",
    value: "12 Jun 2026",
    subtitle: "Riverside Tower",
  },
  monitoredArea: {
    label: "Área Monitorada",
    value: "12.4 ha",
    subtitle: "Estimativa consolidada",
  },
  completedProcessings: {
    label: "Processamentos Concluídos",
    value: "8",
    subtitle: "Ortomosaicos prontos",
  },
  isMockFallback: true,
};
