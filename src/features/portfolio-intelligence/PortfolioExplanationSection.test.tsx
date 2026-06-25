import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mapPortfolioExplanation } from "@/features/explainability/explainability.mapper";
import { samplePortfolioExplanationDto } from "@/features/explainability/explainability.test-fixtures";
import { PortfolioExplanationSection } from "@/features/portfolio-intelligence/PortfolioExplanationSection";

describe("PortfolioExplanationSection", () => {
  it("renders principal fator from backend mainDriver string", () => {
    const explanation = mapPortfolioExplanation(samplePortfolioExplanationDto);

    render(<PortfolioExplanationSection explanation={explanation} />);

    expect(screen.getByText("Principal fator")).toBeInTheDocument();
    expect(screen.getAllByText("2 projetos com atraso crítico").length).toBeGreaterThan(0);
    expect(screen.getByText(explanation.summary)).toBeInTheDocument();
  });
});
