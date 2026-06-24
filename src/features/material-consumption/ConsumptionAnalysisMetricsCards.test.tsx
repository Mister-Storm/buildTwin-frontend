import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConsumptionAnalysisMetricsCards } from "@/features/material-consumption/ConsumptionAnalysisMetricsCards";

describe("ConsumptionAnalysisMetricsCards", () => {
  it("renders factual consumption labels only", () => {
    render(
      <ConsumptionAnalysisMetricsCards
        builtAreaDeltaLabel="180 m²"
        totalConsumedMaterialsLabel="3.000"
      />,
    );

    expect(screen.getByText("Área produzida")).toBeInTheDocument();
    expect(screen.getByText("Total de materiais consumidos")).toBeInTheDocument();
    expect(screen.queryByText(/eficiência/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/desperdício/i)).not.toBeInTheDocument();
  });
});
