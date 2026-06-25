import type {
  MetricExplanationDto,
  PortfolioExplanationDto,
} from "@/types/api/explainability.api";

export const sampleMetricExplanationDto: MetricExplanationDto = {
  summary: "Saúde da obra impactada principalmente pela baixa eficiência de recursos.",
  mainDriver: {
    code: "RESOURCE_EFFICIENCY",
    label: "Eficiência de recursos abaixo da meta",
    contribution: -18,
    severity: "WARNING",
  },
  factors: [
    {
      code: "RESOURCE_EFFICIENCY",
      label: "Eficiência de recursos abaixo da meta",
      contribution: -18,
      severity: "WARNING",
    },
    {
      code: "BUILT_AREA_PROGRESS",
      label: "Progresso de área construída abaixo do esperado",
      contribution: -9,
      severity: "WARNING",
    },
  ],
};

export const sampleForecastExplanationDto: MetricExplanationDto = {
  summary: "Risco crítico de atraso no cronograma com confiança LOW.",
  mainDriver: {
    code: "SCHEDULE_DELAY",
    label: "Conclusão prevista após a data planejada",
    contribution: null,
    severity: "CRITICAL",
  },
  factors: [
    {
      code: "SCHEDULE_DELAY",
      label: "Conclusão prevista após a data planejada",
      contribution: null,
      severity: "CRITICAL",
    },
    {
      code: "LOW_FORECAST_CONFIDENCE",
      label: "Confiança baixa por histórico limitado",
      contribution: null,
      severity: "WARNING",
    },
  ],
};

export const samplePortfolioExplanationDto: PortfolioExplanationDto = {
  summary: "Portfólio com 2 projetos em atraso crítico.",
  mainDriver: "2 projetos com atraso crítico",
  strengths: ["Pontuação média de saúde acima de 85"],
  risks: ["2 projetos com atraso crítico"],
};
