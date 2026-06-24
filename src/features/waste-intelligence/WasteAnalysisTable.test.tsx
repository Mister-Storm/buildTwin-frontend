import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WasteAnalysisTable } from "@/features/waste-intelligence/WasteAnalysisTable";

describe("WasteAnalysisTable", () => {
  it("renders classification column", () => {
    render(
      <WasteAnalysisTable
        rows={[
          {
            materialLabel: "Tijolo",
            actualPerSquareMeterLabel: "12,30 un/m²",
            expectedPerSquareMeterLabel: "10,50 un/m²",
            variancePercentLabel: "+17,1%",
            classification: "WARNING",
            classificationLabel: "Atenção",
            benchmarkSourceLabel: "Padrão do sistema",
          },
        ]}
      />,
    );

    expect(screen.getByText("Classificação")).toBeInTheDocument();
    expect(screen.getByText("Atenção")).toBeInTheDocument();
    expect(screen.getByText("Padrão do sistema")).toBeInTheDocument();
  });
});
