import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PredictedCompletionCard } from "@/features/forecast-intelligence/PredictedCompletionCard";

describe("PredictedCompletionCard", () => {
  it("renders completion date and remaining days", () => {
    render(
      <PredictedCompletionCard
        predictedCompletionDateLabel="15 de jun. de 2027"
        remainingDaysLabel="120 dias"
      />,
    );

    expect(screen.getByText("15 de jun. de 2027")).toBeInTheDocument();
    expect(screen.getByText(/Restante: 120 dias/)).toBeInTheDocument();
  });

  it("renders insufficient data message", () => {
    render(
      <PredictedCompletionCard
        predictedCompletionDateLabel="Dados insuficientes"
        remainingDaysLabel="—"
      />,
    );

    expect(screen.getByText("Dados insuficientes")).toBeInTheDocument();
  });
});
