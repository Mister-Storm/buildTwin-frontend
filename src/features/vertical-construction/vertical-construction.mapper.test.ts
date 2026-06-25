import { describe, expect, it } from "vitest";
import {
  calculatePlannedAverageAreaPerFloor,
  mapVerticalConstructionViewModel,
} from "@/features/vertical-construction/vertical-construction.mapper";
import type { ProjectBuiltAreaSnapshotsDto } from "@/types/api/built-area.api";

describe("vertical-construction.mapper", () => {
  const builtAreaDto: ProjectBuiltAreaSnapshotsDto = {
    projectId: "proj-1",
    snapshots: [
      {
        captureSessionId: "flight-1",
        captureDate: "2026-05-01",
        observedBuiltAreaSquareMeters: 1000,
        confidenceScore: null,
        source: "MANUAL",
        observedFloors: 2,
        notes: "Foundation",
        createdAt: "2026-05-01T10:00:00Z",
      },
      {
        captureSessionId: "flight-2",
        captureDate: "2026-06-15",
        observedBuiltAreaSquareMeters: 5200,
        confidenceScore: 0.9,
        source: "ESTIMATED",
        observedFloors: 4,
        notes: null,
        createdAt: "2026-06-15T10:00:00Z",
      },
    ],
  };

  it("maps vertical metrics and planned average area per floor", () => {
    const viewModel = mapVerticalConstructionViewModel(
      builtAreaDto,
      { plannedAreaSquareMeters: 20_000, plannedFloors: 20 },
      {
        currentBuiltAreaSquareMeters: 5200,
        currentObservedFloors: 4,
        plannedFloors: 20,
        averageAreaPerFloor: 1300,
        verticalCompletionPercent: 20,
      },
    );

    expect(viewModel.currentFloorsLabel).toBe("4");
    expect(viewModel.plannedFloorsLabel).toBe("20");
    expect(viewModel.verticalCompletionLabel).toBe("20,0%");
    expect(viewModel.plannedAverageAreaPerFloorLabel).toContain("1.000");
    expect(viewModel.historyRows).toHaveLength(2);
    expect(viewModel.historyRows[1].source).toBe("Estimada");
  });

  it("maps AI_DETECTED source labels for estimated terminology", () => {
    const aiDto: ProjectBuiltAreaSnapshotsDto = {
      projectId: "proj-1",
      snapshots: [
        {
          captureSessionId: "flight-3",
          captureDate: "2026-07-01",
          observedBuiltAreaSquareMeters: 6000,
          confidenceScore: 0.84,
          source: "AI_DETECTED",
          observedFloors: 8,
          notes: null,
          createdAt: "2026-07-01T10:00:00Z",
        },
      ],
    };

    const viewModel = mapVerticalConstructionViewModel(
      aiDto,
      { plannedAreaSquareMeters: 20_000, plannedFloors: 20 },
      {
        currentBuiltAreaSquareMeters: 6000,
        currentObservedFloors: 8,
        plannedFloors: 20,
        averageAreaPerFloor: 750,
        verticalCompletionPercent: 40,
      },
    );

    expect(viewModel.sourceLabel).toBe("Fonte: IA");
    expect(viewModel.confidenceLabel).toBe("Confiança: 84%");
    expect(viewModel.historyRows[0].source).toBe("IA");
  });

  it("returns null planned average when planned floors absent", () => {
    expect(calculatePlannedAverageAreaPerFloor(20_000, null)).toBeNull();
  });

  it("handles null vertical completion", () => {
    const viewModel = mapVerticalConstructionViewModel(
      builtAreaDto,
      { plannedAreaSquareMeters: 20_000, plannedFloors: null },
      {
        currentBuiltAreaSquareMeters: 5200,
        currentObservedFloors: 4,
        plannedFloors: null,
        averageAreaPerFloor: 1300,
        verticalCompletionPercent: null,
      },
    );

    expect(viewModel.showVerticalCompletion).toBe(false);
    expect(viewModel.plannedFloorsLabel).toBe("Não informado");
  });
});
