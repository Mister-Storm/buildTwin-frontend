import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AreaEvolutionCard } from "@/features/progress-intelligence/AreaEvolutionCard";
import type { ComparisonViewModel } from "@/features/domain/models/temporal-comparison";
import { calculateAreaEvolutionMetrics } from "@/features/progress-intelligence/area-evolution-metrics";

function buildViewModel(): ComparisonViewModel {
  const captureSessionA = {
    sequenceNumber: 1,
    captureSessionId: "flight-a",
    captureDate: new Date(2026, 4, 1),
    captureDateLabel: "1 de mai. de 2026",
    operatorName: "Pilot A",
    previewUrl: "/preview-a",
    areaLabel: "7.250 m²",
    gsdLabel: "2,2 cm/pixel",
    areaSquareMeters: 7250,
    gsdCmPerPixel: 2.2,
  };
  const captureSessionB = {
    sequenceNumber: 2,
    captureSessionId: "flight-b",
    captureDate: new Date(2026, 5, 15),
    captureDateLabel: "15 de jun. de 2026",
    operatorName: "Pilot B",
    previewUrl: "/preview-b",
    areaLabel: "8.441 m²",
    gsdLabel: "2,1 cm/pixel",
    areaSquareMeters: 8441,
    gsdCmPerPixel: 2.1,
  };
  const areaEvolutionMetrics = calculateAreaEvolutionMetrics(
    captureSessionA.areaSquareMeters,
    captureSessionB.areaSquareMeters,
    captureSessionA.captureDate,
    captureSessionB.captureDate,
  );

  return {
    projectId: "proj-1",
    captureSessionA,
    captureSessionB,
    deltaAreaLabel: "+1.191 m²",
    deltaGsdLabel: "−0,1 cm/pixel",
    intervalDaysLabel: "45 dias",
    analytics: {
      captureSessionAId: "flight-a",
      captureSessionBId: "flight-b",
      daysBetween: 45,
      areaA: 7250,
      areaB: 8441,
      areaDelta: 1191,
      areaDeltaPercent: 16.4276,
      gsdA: 2.2,
      gsdB: 2.1,
      gsdDelta: -0.1,
      summary: "EXPANDED_COVERAGE",
    },
    areaEvolutionMetrics,
  };
}

describe("AreaEvolutionCard", () => {
  it("renders full area evolution metrics", () => {
    const viewModel = buildViewModel();

    render(
      <AreaEvolutionCard
        viewModel={viewModel}
        metrics={viewModel.areaEvolutionMetrics}
      />,
    );

    expect(screen.getByText("Evolução da Obra")).toBeInTheDocument();
    expect(screen.getByText("8.441 m²")).toBeInTheDocument();
    expect(screen.getByText("7.250 m²")).toBeInTheDocument();
    expect(screen.getByText("+1.191 m²")).toBeInTheDocument();
    expect(screen.getByText("+16,4%")).toBeInTheDocument();
    expect(screen.getByText("45 dias")).toBeInTheDocument();
    expect(screen.getByText("26,5 m²/dia")).toBeInTheDocument();
    expect(
      screen.getByText("Crescimento de 16,4% entre os levantamentos."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Evolução média de 26,5 m²/dia."),
    ).toBeInTheDocument();
  });

  it("renders fallbacks when area metrics are unavailable", () => {
    const viewModel = buildViewModel();
    const metrics = calculateAreaEvolutionMetrics(
      null,
      viewModel.captureSessionB.areaSquareMeters,
      viewModel.captureSessionA.captureDate,
      viewModel.captureSessionB.captureDate,
    );

    render(<AreaEvolutionCard viewModel={viewModel} metrics={metrics} />);

    expect(screen.getAllByText("Não disponível").length).toBeGreaterThanOrEqual(3);
    expect(
      screen.getByText("Dados insuficientes para calcular evolução."),
    ).toBeInTheDocument();
  });
});
