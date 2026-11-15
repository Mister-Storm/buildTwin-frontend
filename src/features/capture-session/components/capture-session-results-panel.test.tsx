import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CaptureSessionResultsPanel } from "@/features/capture-session/components/capture-session-results-panel";
import wire from "@/services/__fixtures__/jobs-wire.json";
import type { ProcessingJobDetailResponseDto } from "@/types/api/processing.api";

function renderPanel(job: ProcessingJobDetailResponseDto) {
  return render(
    <CaptureSessionResultsPanel
      projectId="project-1"
      captureSessionId={job.captureSessionId}
      job={job}
      report={null}
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
});
