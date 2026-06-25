import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForecastExplanationCard } from "@/features/forecast-intelligence/ForecastExplanationCard";
import { mapMetricExplanation } from "@/features/explainability/explainability.mapper";
import { sampleForecastExplanationDto } from "@/features/explainability/explainability.test-fixtures";

describe("ForecastExplanationCard", () => {
  it("renders principal fator from mainDriver", () => {
    const explanation = mapMetricExplanation(sampleForecastExplanationDto);

    render(<ForecastExplanationCard explanation={explanation} />);

    expect(screen.getByText("Principal fator")).toBeInTheDocument();
    expect(screen.getAllByText("Conclusão prevista após a data planejada").length).toBeGreaterThan(0);
  });
});
