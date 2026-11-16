import { describe, expect, it } from "vitest";
import { formatDate, parseDateOnly } from "@/lib/formatters";
import {
  mapConstructionProgress,
  mapConstructionProgressHistory,
  formatParticipationPercent,
} from "@/features/construction-progress/progress-metrics.mapper";

describe("mapConstructionProgress", () => {
  it("maps construction progress dto to view model labels", () => {
    const viewModel = mapConstructionProgress({
      projectId: "proj-1",
      firstCaptureDate: "2026-05-01",
      lastCaptureDate: "2026-06-15",
      timelineSize: 2,
      currentObservedAreaSquareMeters: 8421,
      deltaAreaFromPreviousCapture: 210,
      deltaAreaFromFirstCapture: 5120,
      averageGrowthPerDay: 34.2,
      estimatedCompletionPercent: 108,
      plannedAreaSquareMeters: 10000,
      dataCoveragePercent: 100,
    });

    expect(viewModel.currentObservedAreaLabel).toBe("8.421 m²");
    expect(viewModel.accumulatedEvolutionLabel).toBe("+5.120 m²");
    expect(viewModel.showEstimatedCompletion).toBe(true);
    expect(viewModel.estimatedCompletionLabel).toBe("+108,0%");
    expect(viewModel.deltaAreaFromFirstCapture).toBe(5120);
  });

  it("hides estimated completion when planned area is absent", () => {
    const viewModel = mapConstructionProgress({
      projectId: "proj-1",
      firstCaptureDate: null,
      lastCaptureDate: null,
      timelineSize: 0,
      currentObservedAreaSquareMeters: null,
      deltaAreaFromPreviousCapture: null,
      deltaAreaFromFirstCapture: null,
      averageGrowthPerDay: null,
      estimatedCompletionPercent: null,
      plannedAreaSquareMeters: null,
      dataCoveragePercent: 0,
    });

    expect(viewModel.showEstimatedCompletion).toBe(false);
  });
});

describe("mapConstructionProgress built-area lineage", () => {
  const baseDto = {
    projectId: "proj-1",
    firstCaptureDate: "2026-05-01",
    lastCaptureDate: "2026-06-15",
    timelineSize: 2,
    currentObservedAreaSquareMeters: null,
    deltaAreaFromPreviousCapture: null,
    deltaAreaFromFirstCapture: null,
    averageGrowthPerDay: null,
    estimatedCompletionPercent: null,
    plannedAreaSquareMeters: 1000,
    dataCoveragePercent: 100,
  };

  it("should describe the selected manual revision when the current observation carries lineage", () => {
    const sut = mapConstructionProgress({
      ...baseDto,
      currentBuiltAreaSquareMeters: 250,
      estimatedCompletionPercent: 25,
      builtAreaObservation: {
        observationId: "obs-1",
        captureSessionId: "flight-2",
        captureDate: "2026-06-15",
        source: "MANUAL",
        revisionId: "rev-2",
        revisionNumber: 2,
        recordedAt: "2026-06-16T12:30:00Z",
        recordedBy: "engineer@example.com",
      },
      builtAreaBaselineObservation: {
        observationId: "obs-0",
        captureSessionId: "flight-1",
        captureDate: "2026-05-01",
        source: "MANUAL",
        revisionId: null,
        revisionNumber: null,
        recordedAt: "2026-05-02T09:00:00Z",
        recordedBy: null,
      },
      builtAreaDeltaFromFirstCaptureSquareMeters: 150,
      builtAreaDeltaFromPreviousCaptureSquareMeters: 150,
    });

    expect(sut.builtAreaLabel).toBe("250 m²");
    expect(sut.builtAreaObservationLabel).toContain("Manual");
    expect(sut.builtAreaObservationLabel).toContain("revisão 2");
    expect(sut.builtAreaObservationLabel).toContain(formatDate(parseDateOnly("2026-06-15")));
    expect(sut.builtAreaObservationLabel).toContain("engineer@example.com");
    expect(sut.builtAreaBaselineLabel).toContain("Manual");
    expect(sut.builtAreaBaselineLabel).toContain(formatDate(parseDateOnly("2026-05-01")));
    expect(sut.builtAreaBaselineLabel).not.toContain("revisão");
    expect(sut.builtAreaDeltaFromFirstLabel).toBe("+150 m²");
  });

  it("should keep a manual observed zero built area distinct from an unknown built area", () => {
    const observedZero = mapConstructionProgress({
      ...baseDto,
      currentBuiltAreaSquareMeters: 0,
      estimatedCompletionPercent: 0,
      builtAreaObservation: {
        observationId: "obs-1",
        captureSessionId: "flight-2",
        captureDate: "2026-06-15",
        source: "MANUAL",
        revisionId: null,
        revisionNumber: null,
        recordedAt: "2026-06-16T12:30:00Z",
        recordedBy: null,
      },
    });
    const unknown = mapConstructionProgress({
      ...baseDto,
      currentBuiltAreaSquareMeters: null,
      builtAreaObservation: null,
    });

    expect(observedZero.builtAreaLabel).toBe("0 m²");
    expect(observedZero.showEstimatedCompletion).toBe(true);
    expect(unknown.builtAreaLabel).toBe("Não disponível");
    expect(unknown.builtAreaObservationLabel).toBeNull();
    expect(unknown.builtAreaDeltaFromFirstLabel).toBe("Não disponível");
    expect(unknown.showEstimatedCompletion).toBe(false);
  });

  it("should keep the legacy payload without lineage fields as unknown built area", () => {
    const sut = mapConstructionProgress(baseDto);

    expect(sut.builtAreaLabel).toBe("Não disponível");
    expect(sut.builtAreaObservationLabel).toBeNull();
    expect(sut.builtAreaBaselineLabel).toBeNull();
  });
});

describe("mapConstructionProgressHistory", () => {
  it("maps history items with backend deltas", () => {
    const history = mapConstructionProgressHistory({
      projectId: "proj-1",
      history: [
        {
          captureSessionId: "f1",
          captureDate: "2026-05-01",
          observedAreaSquareMeters: 3200,
          deltaAreaFromPreviousCapture: null,
        },
        {
          captureSessionId: "f2",
          captureDate: "2026-06-01",
          observedAreaSquareMeters: 3380,
          deltaAreaFromPreviousCapture: 180,
        },
      ],
    });

    expect(history).toHaveLength(2);
    expect(history[1]?.deltaAreaFromPreviousCapture).toBe(180);
  });
});

describe("formatParticipationPercent", () => {
  it("calculates participation from comparison and accumulated deltas", () => {
    expect(formatParticipationPercent(210, 5120)).toBe("+4,1%");
  });

  it("returns unavailable when accumulated delta is not positive", () => {
    expect(formatParticipationPercent(210, null)).toBe("Não disponível");
  });
});
