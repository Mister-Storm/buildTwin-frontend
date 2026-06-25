import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WasteTrendCard } from "@/features/executive-intelligence/WasteTrendCard";

describe("WasteTrendCard", () => {
  it("renders waste trend label", () => {
    render(<WasteTrendCard wasteTrend="IMPROVING" wasteTrendLabel="Melhorando" />);

    expect(screen.getByText("Tendência de Eficiência")).toBeInTheDocument();
    expect(screen.getByText("Melhorando")).toBeInTheDocument();
  });
});
