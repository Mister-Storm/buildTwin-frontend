import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressEvolutionChart } from "@/features/construction-progress/ProgressEvolutionChart";

describe("ProgressEvolutionChart", () => {
  it("renders footprint index chart with accessible label", () => {
    render(
      <ProgressEvolutionChart
        points={[
          { captureDateLabel: "01 mai. 2026", footprintIndex: 0.42 },
          { captureDateLabel: "01 jun. 2026", footprintIndex: 0.72 },
        ]}
      />,
    );

    expect(screen.getByText("Evolução do Índice de Ocupação")).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        "Gráfico de evolução do índice de ocupação do terreno por data de levantamento",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("01 mai. 2026: 42%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("01 jun. 2026: 72%").length).toBeGreaterThan(0);
  });

  it("renders empty state when no points are available", () => {
    render(<ProgressEvolutionChart points={[]} />);

    expect(
      screen.getByText("Nenhum dado disponível para exibir o gráfico."),
    ).toBeInTheDocument();
  });
});
