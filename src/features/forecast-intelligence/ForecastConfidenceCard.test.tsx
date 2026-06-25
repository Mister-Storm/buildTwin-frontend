import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForecastConfidenceCard } from "@/features/forecast-intelligence/ForecastConfidenceCard";

describe("ForecastConfidenceCard", () => {
  it.each([
    ["Alta", "success" as const],
    ["Média", "info" as const],
    ["Baixa", "warning" as const],
  ])("renders %s confidence badge", (label, variant) => {
    render(
      <ForecastConfidenceCard
        viewModel={{ confidenceLabel: label, confidenceVariant: variant }}
      />,
    );

    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
  });
});
