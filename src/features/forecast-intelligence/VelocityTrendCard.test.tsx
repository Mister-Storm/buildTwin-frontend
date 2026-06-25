import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VelocityTrendCard } from "@/features/forecast-intelligence/VelocityTrendCard";

describe("VelocityTrendCard", () => {
  it.each([
    ["ACCELERATING", "Acelerando"],
    ["STABLE", "Estável"],
    ["DECELERATING", "Desacelerando"],
    ["INSUFFICIENT_DATA", "Dados insuficientes"],
  ] as const)("renders %s trend label", (trend, label) => {
    render(<VelocityTrendCard velocityTrend={trend} velocityTrendLabel={label} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
