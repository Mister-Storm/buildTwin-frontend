import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConstructionProgressCard } from "@/features/construction-progress/ConstructionProgressCard";
import type { ConstructionProgressTimelineViewModel } from "@/features/construction-progress/construction-progress.mapper";

const viewModel: ConstructionProgressTimelineViewModel = {
  projectId: "proj-1",
  footprintGrowthSincePreviousLabel: "+11,0%",
  chartPoints: [{ captureDateLabel: "01 mai. 2026", footprintIndex: 0.72 }],
  timeline: [
    {
      captureSessionSequence: 1,
      captureSessionId: "flight-1",
      captureDateLabel: "01 mai. 2026",
      occupiedAreaSquareMeters: 1000,
      occupiedAreaLabel: "1.000 m²",
      footprintIndex: 0.6,
      footprintIndexLabel: "60%",
      visualChangeIndex: null,
      visualChangeLabel: "Não disponível",
    },
    {
      captureSessionSequence: 2,
      captureSessionId: "flight-2",
      captureDateLabel: "01 jun. 2026",
      occupiedAreaSquareMeters: 1250,
      occupiedAreaLabel: "1.250 m²",
      footprintIndex: 0.72,
      footprintIndexLabel: "72%",
      visualChangeIndex: 34,
      visualChangeLabel: "34,0%",
    },
  ],
  latest: {
    captureSessionSequence: 2,
    captureSessionId: "flight-2",
    captureDateLabel: "01 jun. 2026",
    occupiedAreaSquareMeters: 1250,
    occupiedAreaLabel: "1.250 m²",
    footprintIndex: 0.72,
    footprintIndexLabel: "72%",
    visualChangeIndex: 34,
    visualChangeLabel: "34,0%",
  },
};

describe("ConstructionProgressCard", () => {
  it("renders evidence-based metrics without completion labels", () => {
    render(<ConstructionProgressCard viewModel={viewModel} />);

    expect(screen.getByText("Ocupação Atual")).toBeInTheDocument();
    expect(screen.getByText("1.250 m²")).toBeInTheDocument();
    expect(screen.getByText("Índice de Ocupação do Terreno")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.getByText("Alteração Visual")).toBeInTheDocument();
    expect(screen.getByText("34,0%")).toBeInTheDocument();
    expect(screen.getByText("Crescimento desde o Levantamento Anterior")).toBeInTheDocument();
    expect(screen.getByText("+11,0%")).toBeInTheDocument();
    expect(screen.queryByText("Conclusão Estimada")).not.toBeInTheDocument();
    expect(screen.queryByText(/área construída/i)).not.toBeInTheDocument();
  });

  it("renders empty state when latest snapshot is missing", () => {
    render(
      <ConstructionProgressCard
        viewModel={{
          ...viewModel,
          latest: null,
          timeline: [],
          chartPoints: [],
        }}
      />,
    );

    expect(
      screen.getByText("Nenhum dado de ocupação disponível para exibir."),
    ).toBeInTheDocument();
  });
});
