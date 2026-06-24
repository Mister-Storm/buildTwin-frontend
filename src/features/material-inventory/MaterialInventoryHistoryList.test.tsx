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
            metricLabel: "Quantidade",
            metricValueLabel: "5.000",
            unitLabel: "un",
            confidenceLabel: null,
            storageZoneLabel: "North Yard",
            movementTypeLabel: "Estoque",
            source: "MANUAL",
            isAiSource: false,
          },
        ]}
      />,
    );

    expect(screen.getByText("Tijolo")).toBeInTheDocument();
    expect(screen.getByText("North Yard")).toBeInTheDocument();
    expect(screen.getByText("Estoque")).toBeInTheDocument();
    expect(screen.getByText("MANUAL")).toBeInTheDocument();
  });

  it("renders AI badge for detected rows", () => {
    render(
      <MaterialInventoryHistoryList
        rows={[
          {
            rowKey: "row-ai",
            flightDateLabel: "20/06/2026",
            recordedAtLabel: "20/06/2026, 10:00",
            materialLabel: "Madeira",
            metricLabel: "Objetos detectados",
            metricValueLabel: "42",
            unitLabel: "un",
            confidenceLabel: "87%",
            storageZoneLabel: "—",
            movementTypeLabel: "Estoque",
            source: "AI_DETECTED",
            isAiSource: true,
          },
        ]}
      />,
    );

    expect(screen.getByText("IA")).toBeInTheDocument();
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<MaterialInventoryHistoryList rows={[]} />);

    expect(screen.getByText(/Nenhum registro disponível/i)).toBeInTheDocument();
  });
});
