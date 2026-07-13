import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChangeDetectionCard } from "@/features/change-detection/ChangeDetectionCard";
import type { ChangeDetectionViewModel } from "@/features/change-detection/change-detection.mapper";
import { LOW_COMPARISON_QUALITY_WARNING } from "@/features/change-detection/change-level-mapper";

const baseViewModel: ChangeDetectionViewModel = {
  captureSessionAId: "flight-a",
  captureSessionBId: "flight-b",
  changePercentageLabel: "62,1%",
  changedPixelsLabel: "102.314",
  changeLevel: "VERY_HIGH",
  comparisonQuality: "NORMAL",
  heatmapPreviewUrl: "/preview/artifacts/heatmap-1",
};

describe("ChangeDetectionCard", () => {
  it("renders change detection metrics and heatmap", () => {
    render(<ChangeDetectionCard viewModel={baseViewModel} />);

    expect(screen.getByText("Mudanças Detectadas")).toBeInTheDocument();
    expect(screen.getByText("62,1%")).toBeInTheDocument();
    expect(screen.getByText("102.314")).toBeInTheDocument();
    expect(screen.getByText("Nível: Muito alta")).toBeInTheDocument();
    expect(screen.getByText("Qualidade: Normal")).toBeInTheDocument();
    expect(screen.getByText("Vermelho = região alterada")).toBeInTheDocument();
    expect(screen.getByAltText("Mapa de calor das mudanças detectadas")).toHaveAttribute(
      "src",
      "/preview/artifacts/heatmap-1",
    );
  });

  it("shows warning when comparison quality is LOW", () => {
    render(
      <ChangeDetectionCard
        viewModel={{ ...baseViewModel, comparisonQuality: "LOW" }}
      />,
    );

    expect(screen.getByText(LOW_COMPARISON_QUALITY_WARNING)).toBeInTheDocument();
    expect(screen.getByText("Qualidade: Baixa")).toBeInTheDocument();
  });
});
