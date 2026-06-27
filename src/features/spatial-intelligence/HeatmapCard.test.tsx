import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeatmapCard } from "@/features/spatial-intelligence/HeatmapCard";

describe("HeatmapCard", () => {
  it("renders css grid cells for heatmap values", () => {
    render(
      <HeatmapCard
        heatmap={{
          metric: "WASTE",
          metricLabel: "Resíduos",
          rows: 2,
          cols: 2,
          values: [
            [0, 0.5],
            [1, 0.25],
          ],
        }}
      />,
    );

    expect(screen.getByText("Resíduos")).toBeInTheDocument();
    expect(screen.getByTestId("heatmap-grid-WASTE")).toBeInTheDocument();
    expect(screen.getByTestId("heatmap-grid-WASTE").children).toHaveLength(4);
  });
});
