import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutiveExplanationCard } from "@/features/executive-intelligence/ExecutiveExplanationCard";
import { mapMetricExplanation } from "@/features/explainability/explainability.mapper";
import { sampleMetricExplanationDto } from "@/features/explainability/explainability.test-fixtures";

describe("ExecutiveExplanationCard", () => {
  it("renders principal fator from mainDriver without client ranking", () => {
    const explanation = mapMetricExplanation(sampleMetricExplanationDto);

    render(<ExecutiveExplanationCard explanation={explanation} />);

    expect(screen.getByText("Principal fator")).toBeInTheDocument();
    expect(screen.getAllByText(explanation.mainDriver!.label).length).toBeGreaterThan(0);
    expect(screen.getByText(explanation.summary)).toBeInTheDocument();
  });
});
