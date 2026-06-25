import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForecastIntelligenceSection } from "@/features/forecast-intelligence/ForecastIntelligenceSection";
import type { ForecastIntelligenceViewModel } from "@/features/forecast-intelligence/forecast-intelligence.mapper";

const viewModel: ForecastIntelligenceViewModel = {
  predictedCompletionDateLabel: "15 de jun. de 2027",
  remainingDaysLabel: "120 dias",
  scheduleRisk: "ATTENTION",
  scheduleRiskLabel: "Atenção",
  scheduleRiskVariant: "info",
  confidence: "MEDIUM",
  confidenceLabel: "Média",
  confidenceVariant: "info",
  velocityTrend: "STABLE",
  velocityTrendLabel: "Estável",
  velocityTrendVariant: "info",
  projectedPercentAtPlannedLabel: "88,5%",
  generatedAtLabel: "15/06/2026, 09:00:00",
};

describe("ForecastIntelligenceSection", () => {
  it("renders forecast intelligence cards", () => {
    render(<ForecastIntelligenceSection viewModel={viewModel} />);

    expect(screen.getByText("Inteligência Preditiva")).toBeInTheDocument();
    expect(screen.getByText("Conclusão Prevista")).toBeInTheDocument();
    expect(screen.getByText("Risco de Cronograma")).toBeInTheDocument();
    expect(screen.getByText("Confiança da Previsão")).toBeInTheDocument();
    expect(screen.getByText("Tendência de Velocidade")).toBeInTheDocument();
  });
});
