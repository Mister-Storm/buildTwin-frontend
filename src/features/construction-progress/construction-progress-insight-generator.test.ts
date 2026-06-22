import { describe, expect, it } from "vitest";
import { generateConstructionProgressInsights } from "@/features/construction-progress/construction-progress-insight-generator";
import type { ConstructionProgressSnapshotViewModel } from "@/features/construction-progress/construction-progress.mapper";

function snapshot(
  overrides: Partial<ConstructionProgressSnapshotViewModel>,
): ConstructionProgressSnapshotViewModel {
  return {
    flightSequence: 1,
    flightId: "flight-1",
    flightDateLabel: "01 mai. 2026",
    occupiedAreaSquareMeters: 1000,
    occupiedAreaLabel: "1.000 m²",
    footprintIndex: 0.5,
    footprintIndexLabel: "50%",
    visualChangeIndex: null,
    visualChangeLabel: "Não disponível",
    ...overrides,
  };
}

describe("generateConstructionProgressInsights", () => {
  it("flags significant visual change", () => {
    const insights = generateConstructionProgressInsights([
      snapshot({ flightSequence: 1 }),
      snapshot({ flightSequence: 2, visualChangeIndex: 24 }),
    ]);

    expect(insights).toContain(
      "Alterações significativas no terreno foram detectadas desde o levantamento anterior.",
    );
  });

  it("flags stable footprint over last three surveys", () => {
    const insights = generateConstructionProgressInsights([
      snapshot({ flightSequence: 1, footprintIndex: 0.5 }),
      snapshot({ flightSequence: 2, footprintIndex: 0.52 }),
      snapshot({ flightSequence: 3, footprintIndex: 0.51 }),
    ]);

    expect(insights).toContain(
      "A ocupação do terreno permaneceu estável nos levantamentos recentes.",
    );
  });

  it("flags slowing visual change", () => {
    const insights = generateConstructionProgressInsights([
      snapshot({ flightSequence: 1, visualChangeIndex: 30 }),
      snapshot({ flightSequence: 2, visualChangeIndex: 20 }),
      snapshot({ flightSequence: 3, visualChangeIndex: 10 }),
    ]);

    expect(insights).toContain(
      "A atividade de alteração visual parece estar desacelerando.",
    );
  });

  it("returns no insights when thresholds are not met", () => {
    const insights = generateConstructionProgressInsights([
      snapshot({ flightSequence: 1, footprintIndex: 0.2 }),
      snapshot({ flightSequence: 2, footprintIndex: 0.8, visualChangeIndex: 5 }),
    ]);

    expect(insights).toEqual([]);
  });
});
