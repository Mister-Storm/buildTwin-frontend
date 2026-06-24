import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BuiltAreaSection } from "@/features/built-area/BuiltAreaSection";
import type { BuiltAreaViewModel } from "@/features/built-area/built-area.mapper";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const viewModel: BuiltAreaViewModel = {
  projectId: "proj-1",
  currentBuiltAreaSquareMeters: 2500,
  currentBuiltAreaLabel: "2.500 m²",
  plannedAreaSquareMeters: 5000,
  plannedAreaLabel: "5.000 m²",
  completionPercent: 50,
  completionLabel: "50,0%",
  showCompletion: true,
  chartPoints: [
    {
      flightId: "flight-1",
      flightDateLabel: "1 de mai. de 2026",
      observedBuiltAreaSquareMeters: 1000,
    },
  ],
  hasSnapshots: true,
  sourceLabel: null,
  confidenceLabel: null,
};

describe("BuiltAreaSection", () => {
  it("renders built area metrics", () => {
    render(
      <BuiltAreaSection
        viewModel={viewModel}
        flights={[
          {
            flightId: "flight-1",
            flightDate: "2026-05-01",
            operatorName: "Pilot",
            imageCount: 10,
            latestProcessingStatus: "COMPLETED",
            latestJobId: "job-1",
          },
        ]}
      />,
    );

    expect(screen.getByText("Área Construída")).toBeInTheDocument();
    expect(screen.getByText("Área Construída Atual")).toBeInTheDocument();
    expect(screen.getByText("2.500 m²")).toBeInTheDocument();
    expect(screen.getByText("Conclusão Estimada")).toBeInTheDocument();
    expect(screen.getByText("50,0%")).toBeInTheDocument();
    expect(screen.getByText("Registrar Área Construída")).toBeInTheDocument();
    expect(screen.getByText("Detectar Área com IA")).toBeInTheDocument();
  });
});
