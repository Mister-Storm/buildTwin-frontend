import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VelocityCard } from "@/features/executive-intelligence/VelocityCard";

describe("VelocityCard", () => {
  it("renders velocity metrics", () => {
    render(
      <VelocityCard
        builtAreaVelocityLabel="+8,9 m²/dia"
        floorVelocityLabel="+0,12 pav./dia"
      />,
    );

    expect(screen.getByText("Velocidade de Construção")).toBeInTheDocument();
    expect(screen.getByText("+8,9 m²/dia")).toBeInTheDocument();
    expect(screen.getByText("+0,12 pav./dia")).toBeInTheDocument();
  });

  it("renders insufficient data message", () => {
    render(
      <VelocityCard
        builtAreaVelocityLabel="Dados insuficientes"
        floorVelocityLabel="Dados insuficientes"
      />,
    );

    expect(screen.getAllByText("Dados insuficientes")).toHaveLength(2);
  });
});
