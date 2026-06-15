import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComparisonInsightsCard } from "@/features/temporal-comparison/ComparisonInsightsCard";
import type { ComparisonViewModel } from "@/features/domain/models/temporal-comparison";
import { computeChangeAnalytics } from "@/features/temporal-comparison/analytics/change-analytics";

function buildViewModel(): ComparisonViewModel {
  const flightA = {
    sequenceNumber: 1,
    flightId: "flight-a",
    flightDate: new Date(2026, 4, 1),
    flightDateLabel: "1 de mai. de 2026",
    operatorName: "Pilot A",
    previewUrl: "/preview-a",
    areaLabel: "8.000,0 m²",
    gsdLabel: "2,2 cm/pixel",
    areaSquareMeters: 8000,
    gsdCmPerPixel: 2.2,
  };
  const flightB = {
    sequenceNumber: 2,
    flightId: "flight-b",
    flightDate: new Date(2026, 5, 15),
    flightDateLabel: "15 de jun. de 2026",
    operatorName: "Pilot B",
    previewUrl: "/preview-b",
    areaLabel: "8.960,0 m²",
    gsdLabel: "2,1 cm/pixel",
    areaSquareMeters: 8960,
    gsdCmPerPixel: 2.1,
  };
  const analytics = computeChangeAnalytics(flightA, flightB);

  return {
    projectId: "proj-1",
    flightA,
    flightB,
    deltaAreaLabel: "+960 m²",
    deltaGsdLabel: "−0,1 cm/pixel",
    intervalDaysLabel: "45 dias",
    analytics,
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
    const flightA = {
      sequenceNumber: 1,
      flightId: "flight-a",
      flightDate: new Date(2026, 4, 1),
      flightDateLabel: "1 de mai. de 2026",
      operatorName: "Pilot A",
      previewUrl: "/preview-a",
      areaLabel: null,
      gsdLabel: null,
      areaSquareMeters: null,
      gsdCmPerPixel: null,
    };
    const flightB = {
      sequenceNumber: 2,
      flightId: "flight-b",
      flightDate: new Date(2026, 5, 15),
      flightDateLabel: "15 de jun. de 2026",
      operatorName: "Pilot B",
      previewUrl: "/preview-b",
      areaLabel: null,
      gsdLabel: null,
      areaSquareMeters: null,
      gsdCmPerPixel: null,
    };
    const analytics = computeChangeAnalytics(flightA, flightB);
    const viewModel: ComparisonViewModel = {
      projectId: "proj-1",
      flightA,
      flightB,
      deltaAreaLabel: null,
      deltaGsdLabel: null,
      intervalDaysLabel: "45 dias",
      analytics,
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
