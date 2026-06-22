import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaterialInventoryHistoryList } from "@/features/material-inventory/MaterialInventoryHistoryList";

describe("MaterialInventoryHistoryList", () => {
  it("renders history rows with storage zone and movement type", () => {
    render(
      <MaterialInventoryHistoryList
        rows={[
          {
            rowKey: "row-1",
            flightDateLabel: "01/05/2026",
            recordedAtLabel: "01/05/2026, 10:00",
            materialLabel: "Tijolo",
            quantityLabel: "5.000",
            unitLabel: "un",
            storageZoneLabel: "North Yard",
            movementTypeLabel: "Estoque",
            source: "MANUAL",
          },
        ]}
      />,
    );

    expect(screen.getByText("Tijolo")).toBeInTheDocument();
    expect(screen.getByText("North Yard")).toBeInTheDocument();
    expect(screen.getByText("Estoque")).toBeInTheDocument();
    expect(screen.getByText("MANUAL")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<MaterialInventoryHistoryList rows={[]} />);

    expect(screen.getByText(/Nenhum registro disponível/i)).toBeInTheDocument();
  });
});
