import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpatialSummaryCard } from "@/features/spatial-intelligence/SpatialSummaryCard";

describe("SpatialSummaryCard", () => {
  it("renders dominant region and grid coverage", () => {
    render(
      <SpatialSummaryCard
        summary={{
          dominantRegionLabel: "Norte",
          gridLabel: "20×20",
          coverageLabel: "75.0% da grade",
          topHotspots: [],
        }}
      />,
    );

    expect(screen.getByText("Região dominante")).toBeInTheDocument();
    expect(screen.getByText("Norte")).toBeInTheDocument();
    expect(screen.getByText("Grade 20×20")).toBeInTheDocument();
    expect(screen.getByText("Cobertura: 75.0% da grade")).toBeInTheDocument();
  });
});
