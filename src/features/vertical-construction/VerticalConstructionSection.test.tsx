import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VerticalConstructionSection } from "@/features/vertical-construction/VerticalConstructionSection";
import type { VerticalConstructionViewModel } from "@/features/vertical-construction/vertical-construction.mapper";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const viewModel: VerticalConstructionViewModel = {
  projectId: "proj-1",
  currentFloorsLabel: "4",
  plannedFloorsLabel: "20",
  verticalCompletionLabel: "20,0%",
  showVerticalCompletion: true,
  currentBuiltAreaLabel: "5.200 m²",
  averageAreaPerFloorLabel: "1.300 m²",
  plannedAverageAreaPerFloorLabel: "1.000 m²",
  historyRows: [
    {
      captureSessionId: "flight-1",
      captureDateLabel: "1 de jun. de 2026",
      builtAreaLabel: "5.200 m²",
      floorsLabel: "4",
      notesLabel: "Structural phase",
      source: "MANUAL",
    },
  ],
  hasSnapshots: true,
  sourceLabel: null,
  confidenceLabel: null,
};

const captureSessions = [
  {
    captureSessionId: "flight-1",
    captureDate: "2026-06-01",
    operatorName: "Pilot",
    imageCount: 1,
    status: "COMPLETED",
  },
];

describe("VerticalConstructionSection", () => {
  it("renders vertical construction metric cards", () => {
    render(<VerticalConstructionSection viewModel={viewModel} captureSessions={captureSessions} />);

    expect(screen.getByText("Construção Vertical")).toBeInTheDocument();
    expect(screen.getByText("Pavimentos Atuais")).toBeInTheDocument();
    expect(screen.getByText("Pavimentos Planejados")).toBeInTheDocument();
    expect(screen.getByText("Conclusão Vertical")).toBeInTheDocument();
    expect(screen.getByText("Área Média Planejada/Pavimento")).toBeInTheDocument();
    expect(screen.getByText("Structural phase")).toBeInTheDocument();
  });
});
