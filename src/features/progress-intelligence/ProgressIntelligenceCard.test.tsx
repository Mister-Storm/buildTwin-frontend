import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressIntelligenceCard } from "@/features/progress-intelligence/ProgressIntelligenceCard";
import { mapProgressIntelligence } from "@/features/progress-intelligence/progress-intelligence.mapper";

describe("ProgressIntelligenceCard", () => {
  it("renders executive progress intelligence metrics and insight", () => {
    const viewModel = mapProgressIntelligence({
      flightA: "flight-a",
      flightB: "flight-b",
      changePercentage: 24.3,
      deltaDays: 14,
      averageDailyChange: 1.73,
      classification: "MEDIUM",
      confidenceScore: 1.0,
      trend: "UNKNOWN",
    });

    render(<ProgressIntelligenceCard viewModel={viewModel} />);

    expect(screen.getByText("Indicador de Progresso")).toBeInTheDocument();
    expect(screen.getByText("24,3%")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    expect(screen.getByText("1,73% ao dia")).toBeInTheDocument();
    expect(screen.getByText("14 dias")).toBeInTheDocument();
    expect(
      screen.getByText("Evolução consistente observada no período analisado."),
    ).toBeInTheDocument();
  });
});
