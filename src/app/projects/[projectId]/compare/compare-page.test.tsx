import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/proj-1/compare",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/services/projects.service", () => ({
  getProject: vi.fn().mockResolvedValue({ id: "proj-1", name: "Obra Teste" }),
}));

vi.mock("@/features/temporal-comparison/load-comparison-view-model", () => ({
  loadComparisonViewModel: vi.fn(),
}));

vi.mock("@/features/change-detection/load-change-detection", () => ({
  loadChangeDetection: vi.fn(),
}));

vi.mock("@/features/progress-intelligence/load-progress-intelligence", () => ({
  loadProgressIntelligence: vi.fn(),
}));

import ComparePage from "@/app/projects/[projectId]/compare/page";
import { loadChangeDetection } from "@/features/change-detection/load-change-detection";
import { loadComparisonViewModel } from "@/features/temporal-comparison/load-comparison-view-model";
import { loadProgressIntelligence } from "@/features/progress-intelligence/load-progress-intelligence";

describe("ComparePage", () => {
  it("renders side-by-side previews when comparison succeeds", async () => {
    vi.mocked(loadComparisonViewModel).mockResolvedValue({
      status: "success",
      timeline: [],
      viewModel: {
        projectId: "proj-1",
        flightA: {
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
        },
        flightB: {
          sequenceNumber: 2,
          flightId: "flight-b",
          flightDate: new Date(2026, 5, 15),
          flightDateLabel: "15 de jun. de 2026",
          operatorName: "Pilot B",
          previewUrl: "/preview-b",
          areaLabel: "8.421,4 m²",
          gsdLabel: "2,1 cm/pixel",
          areaSquareMeters: 8421.4,
          gsdCmPerPixel: 2.1,
        },
        deltaAreaLabel: "+421,4 m²",
        deltaGsdLabel: "−0,1 cm/pixel",
        intervalDaysLabel: "45 dias",
        analytics: {
          flightAId: "flight-a",
          flightBId: "flight-b",
          daysBetween: 45,
          areaA: 8000,
          areaB: 8421.4,
          areaDelta: 421.4,
          areaDeltaPercent: 5.2675,
          gsdA: 2.2,
          gsdB: 2.1,
          gsdDelta: -0.1,
          summary: "EXPANDED_COVERAGE",
        },
        areaEvolutionMetrics: {
          areaDelta: 421.4,
          areaDeltaPercent: 5.2675,
          daysBetween: 45,
          growthPerDay: 9.3644,
        },
      },
    });
    vi.mocked(loadChangeDetection).mockResolvedValue({
      status: "success",
      viewModel: {
        flightAId: "flight-a",
        flightBId: "flight-b",
        changePercentageLabel: "62,1%",
        changedPixelsLabel: "102.314",
        changeLevel: "VERY_HIGH",
        comparisonQuality: "NORMAL",
        heatmapPreviewUrl: "/api/v1/artifacts/heatmap-1/preview",
      },
    });
    vi.mocked(loadProgressIntelligence).mockResolvedValue({
      status: "success",
      viewModel: {
        flightAId: "flight-a",
        flightBId: "flight-b",
        changePercentageLabel: "24,3%",
        classification: "MEDIUM",
        classificationLabel: "MEDIUM",
        averageDailyChangeLabel: "1,73% ao dia",
        periodLabel: "14 dias",
      },
    });

    const ui = await ComparePage({
      params: Promise.resolve({ projectId: "proj-1" }),
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByText("Comparação Temporal")).toBeInTheDocument();
    expect(screen.getByText("Comparativo")).toBeInTheDocument();
    expect(screen.getByText("Evolução da Obra")).toBeInTheDocument();
    expect(screen.getByText("Indicador de Progresso")).toBeInTheDocument();
    expect(screen.getByText("Mudanças Detectadas")).toBeInTheDocument();
    expect(screen.getByText("Análise de Evolução")).toBeInTheDocument();
    expect(screen.getByAltText("Levantamento A — 1 de mai. de 2026")).toHaveAttribute(
      "src",
      "/preview-a",
    );
    expect(screen.getByAltText("Levantamento B — 15 de jun. de 2026")).toHaveAttribute(
      "src",
      "/preview-b",
    );
  });

  it("renders insufficient state message", async () => {
    vi.mocked(loadComparisonViewModel).mockResolvedValue({
      status: "insufficient",
      message:
        "São necessários pelo menos dois levantamentos processados para realizar uma comparação temporal.",
      timeline: [
        {
          sequenceNumber: 1,
          flightId: "flight-only",
          flightDate: new Date(2026, 5, 1),
          flightDateLabel: "1 de jun. de 2026",
          operatorName: "Pilot",
          previewUrl: "/preview",
          areaLabel: null,
          gsdLabel: null,
          areaSquareMeters: null,
          gsdCmPerPixel: null,
        },
      ],
    });

    const ui = await ComparePage({
      params: Promise.resolve({ projectId: "proj-1" }),
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByText("Comparação indisponível")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver obra" })).toHaveAttribute(
      "href",
      "/projects/proj-1",
    );
  });
});
