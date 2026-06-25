import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MaterialConsumptionTable } from "@/features/material-consumption/MaterialConsumptionTable";

describe("MaterialConsumptionTable", () => {
  it("renders Consumo/m² column", () => {
    render(
      <MaterialConsumptionTable
        rows={[
          {
            materialLabel: "Tijolo",
            quantityAtCaptureSessionALabel: "10.000 un",
            quantityAtCaptureSessionBLabel: "7.000 un",
            quantityConsumedLabel: "+3.000 un",
            consumptionPerSquareMeterLabel: "16,67 un/m²",
          },
        ]}
      />,
    );

    expect(screen.getByText("Consumo/m²")).toBeInTheDocument();
    expect(screen.getByText("Tijolo")).toBeInTheDocument();
    expect(screen.getByText("16,67 un/m²")).toBeInTheDocument();
  });
});
