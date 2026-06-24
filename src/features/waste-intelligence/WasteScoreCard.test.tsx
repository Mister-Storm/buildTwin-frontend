import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WasteScoreCard } from "@/features/waste-intelligence/WasteScoreCard";

describe("WasteScoreCard", () => {
  it("renders waste score and confidence labels", () => {
    render(
      <WasteScoreCard
        wasteScoreLabel="82"
        materialsAtRiskLabel="1"
        criticalMaterialsLabel="0"
        confidenceLabel="85%"
        benchmarkVersionLabel="2026.1"
      />,
    );

    expect(screen.getByText("Waste Score")).toBeInTheDocument();
    expect(screen.getByText("Confiança")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Benchmark 2026.1")).toBeInTheDocument();
  });
});
