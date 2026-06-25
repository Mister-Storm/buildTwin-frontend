import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortfolioInsightsSection } from "@/features/portfolio-intelligence/PortfolioInsightsSection";

describe("PortfolioInsightsSection", () => {
  it("renders insight cards by severity", () => {
    render(
      <PortfolioInsightsSection
        insights={[
          {
            title: "Projetos com atraso crítico",
            description: "1 projeto com risco CRITICAL_DELAY no cronograma.",
            severity: "CRITICAL",
            severityLabel: "Crítico",
            severityVariant: "error",
          },
        ]}
      />,
    );

    expect(screen.getByText("Projetos com atraso crítico")).toBeInTheDocument();
    expect(screen.getByText("Crítico")).toBeInTheDocument();
  });
});
