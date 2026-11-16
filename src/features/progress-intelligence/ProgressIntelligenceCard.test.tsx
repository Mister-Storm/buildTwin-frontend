import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressIntelligenceCard } from "@/features/progress-intelligence/ProgressIntelligenceCard";
import { mapProgressIntelligence } from "@/features/progress-intelligence/progress-intelligence.mapper";
import type { VisualProgressIntelligenceDto } from "@/types/api/visual-progress-intelligence.api";

const availableDto: VisualProgressIntelligenceDto = {
  captureSessionA: "flight-a",
  captureSessionB: "flight-b",
  changePercentage: 24.3,
  deltaDays: 14,
  averageDailyChange: 1.73,
  classification: "MEDIUM",
  confidenceScore: 1.0,
  trend: "UNKNOWN",
  evidenceStatus: "AVAILABLE",
  unavailableReason: null,
};

describe("ProgressIntelligenceCard", () => {
  it("renders executive progress intelligence metrics and insight", () => {
    const viewModel = mapProgressIntelligence(availableDto);

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

  it("should label the figures as visual change and not physical progress when evidence is available", () => {
    const sut = mapProgressIntelligence(availableDto);

    render(<ProgressIntelligenceCard viewModel={sut} />);

    expect(screen.getByText("Mudança visual observada")).toBeInTheDocument();
    expect(screen.getByText(/não representa progresso físico/i)).toBeInTheDocument();
  });

  it("should show the unavailable reason and no figures or narrative when evidence is unavailable", () => {
    const sut = mapProgressIntelligence({
      ...availableDto,
      changePercentage: null,
      averageDailyChange: null,
      confidenceScore: null,
      classification: "LOW",
      evidenceStatus: "UNAVAILABLE",
      unavailableReason: "COMPARISON_QUALITY_LOW",
    });

    render(<ProgressIntelligenceCard viewModel={sut} />);

    expect(screen.getAllByText("Não disponível")).toHaveLength(3);
    expect(screen.queryByText("0,0%")).not.toBeInTheDocument();
    expect(screen.queryByText("LOW")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Pouca evolução visual identificada entre os levantamentos."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/qualidade/i);
  });

  it("should show an inconclusive notice and no narrative when the reconstruction is inconclusive", () => {
    const sut = mapProgressIntelligence({
      ...availableDto,
      changePercentage: 0,
      averageDailyChange: 0,
      confidenceScore: 0,
      classification: "LOW",
      evidenceStatus: "INCONCLUSIVE",
      unavailableReason: "INCONCLUSIVE_RECONSTRUCTION_VARIABILITY",
    });

    render(<ProgressIntelligenceCard viewModel={sut} />);

    expect(screen.getAllByText("Inconclusivo")).toHaveLength(3);
    expect(screen.queryByText("0,0%")).not.toBeInTheDocument();
    expect(screen.queryByText("0,00% ao dia")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Pouca evolução visual identificada entre os levantamentos."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/variabilidade/i);
  });
});
