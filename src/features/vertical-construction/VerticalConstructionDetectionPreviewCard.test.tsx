import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ESTIMATED_HEIGHT_LABEL,
  VerticalConstructionDetectionPreviewCard,
} from "@/features/vertical-construction/VerticalConstructionDetectionPreviewCard";

vi.mock("@/services/api-client", () => ({
  artifactPreviewUrl: (artifactId: string) => `/api/v1/artifacts/${artifactId}/preview`,
}));

describe("VerticalConstructionDetectionPreviewCard", () => {
  it("renders preview with estimated height label", () => {
    render(
      <VerticalConstructionDetectionPreviewCard
        previewArtifactId="artifact-1"
        detectedFloors={8}
        estimatedHeightMeters={27.4}
        confidenceScore={0.84}
      />,
    );

    expect(screen.getByText(/Pré-visualização da Detecção Vertical/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(ESTIMATED_HEIGHT_LABEL, "i"))).toBeInTheDocument();
    expect(screen.getByText(/27,4 m/)).toBeInTheDocument();
    expect(screen.getByText(/84%/)).toBeInTheDocument();
    expect(screen.queryByText(/^Altura:/)).not.toBeInTheDocument();
  });

  it("returns null without preview artifact id", () => {
    const { container } = render(
      <VerticalConstructionDetectionPreviewCard
        previewArtifactId={null}
        detectedFloors={null}
        estimatedHeightMeters={null}
        confidenceScore={null}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
