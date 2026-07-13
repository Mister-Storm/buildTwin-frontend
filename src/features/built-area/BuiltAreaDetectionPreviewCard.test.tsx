import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BuiltAreaDetectionPreviewCard } from "@/features/built-area/BuiltAreaDetectionPreviewCard";

vi.mock("@/services/api-client", () => ({
  artifactPreviewUrl: (artifactId: string) => `/preview/artifacts/${artifactId}`,
}));

describe("BuiltAreaDetectionPreviewCard", () => {
  it("renders preview image area and confidence", () => {
    render(
      <BuiltAreaDetectionPreviewCard
        previewArtifactId="artifact-1"
        detectedAreaSquareMeters={1243.5}
        confidenceScore={0.82}
      />,
    );

    expect(screen.getByText(/Pré-visualização da Detecção de Área/i)).toBeInTheDocument();
    expect(screen.getByText(/1.243,5 m²/)).toBeInTheDocument();
    expect(screen.getByText(/82%/)).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/preview/artifacts/artifact-1",
    );
  });

  it("returns null without preview artifact id", () => {
    const { container } = render(
      <BuiltAreaDetectionPreviewCard
        previewArtifactId={null}
        detectedAreaSquareMeters={null}
        confidenceScore={null}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
