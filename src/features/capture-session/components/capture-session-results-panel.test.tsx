import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CaptureSessionResultsPanel } from "@/features/capture-session/components/capture-session-results-panel";
import wire from "@/services/__fixtures__/jobs-wire.json";
import type { ProcessingJobDetailResponseDto } from "@/types/api/processing.api";
import type { ProgressReportResponseDto } from "@/types/api/report.api";

function renderPanel(
  job: ProcessingJobDetailResponseDto,
  report: ProgressReportResponseDto | null = null,
) {
  return render(
    <CaptureSessionResultsPanel
      projectId="project-1"
      captureSessionId={job.captureSessionId}
      job={job}
      report={report}
    />,
  );
}

describe("CaptureSessionResultsPanel quality disclosure", () => {
  it("should disclose unknown quality instead of reduced quality when the orthomosaic has no recorded profile", () => {
    renderPanel(wire.legacyProfileOmitted.body as unknown as ProcessingJobDetailResponseDto);

    expect(screen.getByRole("status")).toHaveTextContent("Qualidade do ortomosaico não informada");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Este processamento não registrou perfil nem confiabilidade de medição",
    );
    expect(screen.queryByText("Ortomosaico gerado com qualidade reduzida")).not.toBeInTheDocument();
  });

  it("should not show a quality banner when the orthomosaic declares the standard profile", () => {
    renderPanel(wire.standardCompleted.body as unknown as ProcessingJobDetailResponseDto);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("should present fallback purpose and limits instead of executive progress when the report is fallback", () => {
    renderPanel(wire.standardCompleted.body as unknown as ProcessingJobDetailResponseDto, {
      id: "00000000-0000-4000-8000-000000000001",
      captureSessionId: "00000000-0000-4000-8000-000000000002",
      reportPath: "reports/fallback.pdf",
      generatedAt: "2026-11-16T12:00:00Z",
      artifactId: "00000000-0000-4000-8000-000000000003",
      purpose: "FALLBACK_VISUAL_EVIDENCE",
      processingProfile: "FALLBACK",
      measurementReliability: "LOW",
      limitations: [
        "NOT_EXECUTIVE_PROGRESS_ASSESSMENT",
        "NO_CERTIFIED_METRIC_ACCURACY",
        "NO_3D_RECONSTRUCTION",
      ],
    });

    expect(
      screen.getAllByText(/Evidência visual simplificada/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("Não é avaliação executiva de progresso da obra"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/progresso da construção/i)).not.toBeInTheDocument();
  });
});

