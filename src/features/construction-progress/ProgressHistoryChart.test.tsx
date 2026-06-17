import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressHistoryChart } from "@/features/construction-progress/ProgressHistoryChart";

describe("ProgressHistoryChart", () => {
  it("renders chart points for history data", () => {
    render(
      <ProgressHistoryChart
        history={[
          {
            flightId: "f1",
            flightDateLabel: "1 de mai. de 2026",
            observedAreaSquareMeters: 3200,
            deltaAreaFromPreviousFlight: null,
          },
          {
            flightId: "f2",
            flightDateLabel: "1 de jun. de 2026",
            observedAreaSquareMeters: 8421,
            deltaAreaFromPreviousFlight: 5221,
          },
        ]}
      />,
    );

    expect(screen.getByText("Histórico de Área Observada")).toBeInTheDocument();
    expect(screen.getAllByText(/3\.200 m²/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/8\.421 m²/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when history is empty", () => {
    render(<ProgressHistoryChart history={[]} />);

    expect(
      screen.getByText("Nenhum dado disponível para exibir o gráfico."),
    ).toBeInTheDocument();
  });
});
