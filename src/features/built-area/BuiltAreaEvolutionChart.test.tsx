import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BuiltAreaEvolutionChart } from "@/features/built-area/BuiltAreaEvolutionChart";

describe("BuiltAreaEvolutionChart", () => {
  it("renders chart points for built area data", () => {
    render(
      <BuiltAreaEvolutionChart
        points={[
          {
            captureSessionId: "f1",
            captureDateLabel: "1 de mai. de 2026",
            observedBuiltAreaSquareMeters: 1200,
          },
          {
            captureSessionId: "f2",
            captureDateLabel: "1 de jun. de 2026",
            observedBuiltAreaSquareMeters: 2500,
          },
        ]}
      />,
    );

    expect(screen.getByText("Evolução da Área Construída")).toBeInTheDocument();
    expect(screen.getAllByText(/1\.200 m²/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/2\.500 m²/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when points are empty", () => {
    render(<BuiltAreaEvolutionChart points={[]} />);

    expect(
      screen.getByText("Nenhum dado disponível para exibir o gráfico."),
    ).toBeInTheDocument();
  });
});
