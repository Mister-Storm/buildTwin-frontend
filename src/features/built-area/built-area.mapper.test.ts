import { describe, expect, it } from "vitest";
import {
  calculateCompletionPercent,
  mapBuiltAreaViewModel,
  selectLatestSnapshot,
} from "@/features/built-area/built-area.mapper";
import type { ProjectBuiltAreaSnapshotsDto } from "@/types/api/built-area.api";

describe("built-area.mapper", () => {
  const baseDto: ProjectBuiltAreaSnapshotsDto = {
    projectId: "proj-1",
    snapshots: [
      {
        flightId: "flight-1",
        flightDate: "2026-05-01",
        observedBuiltAreaSquareMeters: 1000,
        confidenceScore: null,
        source: "MANUAL",
        observedFloors: null,
        notes: null,
        createdAt: "2026-05-01T10:00:00Z",
      },
      {
        flightId: "flight-2",
        flightDate: "2026-06-15",
        observedBuiltAreaSquareMeters: 2500,
        confidenceScore: null,
        source: "MANUAL",
        observedFloors: null,
        notes: null,
        createdAt: "2026-06-15T10:00:00Z",
      },
    ],
  };

  it("maps current built area from latest snapshot", () => {
    const viewModel = mapBuiltAreaViewModel(baseDto, {
      plannedAreaSquareMeters: 5000,
    });

    expect(viewModel.currentBuiltAreaSquareMeters).toBe(2500);
    expect(viewModel.plannedAreaLabel).toContain("5.000");
    expect(viewModel.completionPercent).toBe(50);
    expect(viewModel.chartPoints).toHaveLength(2);
  });

  it("maps AI source and confidence labels", () => {
    const viewModel = mapBuiltAreaViewModel(
      {
        projectId: "proj-1",
        snapshots: [
          {
            flightId: "flight-1",
            flightDate: "2026-06-15",
            observedBuiltAreaSquareMeters: 2500,
            confidenceScore: 0.82,
            source: "AI_DETECTED",
            observedFloors: null,
            notes: null,
            createdAt: "2026-06-15T10:00:00Z",
          },
        ],
      },
      { plannedAreaSquareMeters: 5000 },
    );

    expect(viewModel.sourceLabel).toBe("Fonte: IA");
    expect(viewModel.confidenceLabel).toBe("Confiança: 82%");
  });

  it("clamps completion percent at 100", () => {
    expect(calculateCompletionPercent(15000, 10000)).toBe(100);
  });

  it("prefers manual source on same flight date", () => {
    const latest = selectLatestSnapshot([
      {
        flightDate: "2026-06-01",
        source: "ESTIMATED",
        createdAt: "2026-06-01T12:00:00Z",
        observedBuiltAreaSquareMeters: 900,
      },
      {
        flightDate: "2026-06-01",
        source: "MANUAL",
        createdAt: "2026-06-01T10:00:00Z",
        observedBuiltAreaSquareMeters: 1000,
      },
    ]);

    expect(latest?.observedBuiltAreaSquareMeters).toBe(1000);
  });
});
