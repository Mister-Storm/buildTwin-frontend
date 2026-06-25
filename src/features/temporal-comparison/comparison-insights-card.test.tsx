import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComparisonInsightsCard } from "@/features/temporal-comparison/ComparisonInsightsCard";
import type { ComparisonViewModel } from "@/features/domain/models/temporal-comparison";
import { computeChangeAnalytics } from "@/features/temporal-comparison/analytics/change-analytics";
import { calculateAreaEvolutionMetrics } from "@/features/progress-intelligence/area-evolution-metrics";

function buildViewModel(): ComparisonViewModel {
  const captureSessionA = {
    sequenceNumber: 1,
    captureSessionId: "flight-a",
    captureDate: new Date(2026, 4, 1),
    captureDateLabel: "1 de mai. de 2026",
    operatorName: "Pilot A",
    previewUrl: "/preview-a",
    areaLabel: "8.000,0 m²",
    gsdLabel: "2,2 cm/pixel",
    areaSquareMeters: 8000,
    gsdCmPerPixel: 2.2,
  };
  const captureSessionB = {
    sequenceNumber: 2,
    captureSessionId: "flight-b",
    captureDate: new Date(2026, 5, 15),
    captureDateLabel: "15 de jun. de 2026",
    operatorName: "Pilot B",
    previewUrl: "/preview-b",
    areaLabel: "8.960,0 m²",
    gsdLabel: "2,1 cm/pixel",
    areaSquareMeters: 8960,
    gsdCmPerPixel: 2.1,
  };
  const analytics = computeChangeAnalytics(captureSessionA, captureSessionB);

  return {
    projectId: "proj-1",
    captureSessionA,
    captureSessionB,
    deltaAreaLabel: "+960 m²",
    deltaGsdLabel: "−0,1 cm/pixel",
    intervalDaysLabel: "45 dias",
    analytics,
    areaEvolutionMetrics: calculateAreaEvolutionMetrics(
      captureSessionA.areaSquareMeters,
      captureSessionB.areaSquareMeters,
      captureSessionA.captureDate,
      captureSessionB.captureDate,
    ),
  };
}

describe("ComparisonInsightsCard", () => {
  it("renders evolution metrics and expanded coverage summary", () => {
    const viewModel = buildViewModel();

    render(
      <ComparisonInsightsCard
        viewModel={viewModel}
        analytics={viewModel.analytics}
      />,
    );

    expect(screen.getByText("Análise de Evolução")).toBeInTheDocument();
    expect(screen.getByText("45 dias")).toBeInTheDocument();
    expect(screen.getByText("8.000 m²")).toBeInTheDocument();
    expect(screen.getByText("8.960 m²")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText("+960 m²")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A área monitorada aumentou em relação ao levantamento anterior.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Cobertura expandida")).toBeInTheDocument();
    expect(
      screen.getByText("A resolução do levantamento melhorou (menor GSD)."),
    ).toBeInTheDocument();
  });

  it("renders insufficient data message when metrics are missing", () => {
    const captureSessionA = {
      sequenceNumber: 1,
      captureSessionId: "flight-a",
      captureDate: new Date(2026, 4, 1),
      captureDateLabel: "1 de mai. de 2026",
      operatorName: "Pilot A",
      previewUrl: "/preview-a",
      areaLabel: null,
      gsdLabel: null,
      areaSquareMeters: null,
      gsdCmPerPixel: null,
    };
    const captureSessionB = {
      sequenceNumber: 2,
      captureSessionId: "flight-b",
      captureDate: new Date(2026, 5, 15),
      captureDateLabel: "15 de jun. de 2026",
      operatorName: "Pilot B",
      previewUrl: "/preview-b",
      areaLabel: null,
      gsdLabel: null,
      areaSquareMeters: null,
      gsdCmPerPixel: null,
    };
    const analytics = computeChangeAnalytics(captureSessionA, captureSessionB);
    const viewModel: ComparisonViewModel = {
      projectId: "proj-1",
      captureSessionA,
      captureSessionB,
      deltaAreaLabel: null,
      deltaGsdLabel: null,
      intervalDaysLabel: "45 dias",
      analytics,
      areaEvolutionMetrics: calculateAreaEvolutionMetrics(
        captureSessionA.areaSquareMeters,
        captureSessionB.areaSquareMeters,
        captureSessionA.captureDate,
        captureSessionB.captureDate,
      ),
    };

    render(
      <ComparisonInsightsCard viewModel={viewModel} analytics={analytics} />,
    );

    expect(
      screen.getByText("Não há dados suficientes para análise."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Não disponível").length).toBeGreaterThan(0);
  });
});
