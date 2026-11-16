import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressMetricsGrid } from "@/features/construction-progress/ProgressMetricsGrid";
import { ProgressOverviewCard } from "@/features/construction-progress/ProgressOverviewCard";
import { mapConstructionProgress } from "@/features/construction-progress/progress-metrics.mapper";
import type { ProjectConstructionProgressDto } from "@/types/api/construction-progress.api";

const baseDto: ProjectConstructionProgressDto = {
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

describe("ProgressOverviewCard", () => {
  it("should render the manual revision lineage and approved built area when the producer selects a revised observation", () => {
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
    });

    render(
      <>
        <ProgressOverviewCard viewModel={sut} />
        <ProgressMetricsGrid viewModel={sut} />
      </>,
    );

    expect(screen.getByText(/revisão 2/)).toBeInTheDocument();
    expect(screen.getByText("250 m²")).toBeInTheDocument();
    expect(screen.getByText("Área Construída Aprovada")).toBeInTheDocument();
  });

  it("should state that no approved built area exists instead of showing zero when the observation is unknown", () => {
    const sut = mapConstructionProgress(baseDto);

    render(
      <>
        <ProgressOverviewCard viewModel={sut} />
        <ProgressMetricsGrid viewModel={sut} />
      </>,
    );

    expect(
      screen.getByText("Nenhuma área construída aprovada registrada."),
    ).toBeInTheDocument();
    expect(screen.queryByText("0 m²")).not.toBeInTheDocument();
  });
});
