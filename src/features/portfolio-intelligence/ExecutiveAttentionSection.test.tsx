import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutiveAttentionSection } from "@/features/portfolio-intelligence/ExecutiveAttentionSection";

describe("ExecutiveAttentionSection", () => {
  it("renders attention score and level badges", () => {
    render(
      <ExecutiveAttentionSection
        projects={[
          {
            projectId: "p1",
            projectName: "Beta",
            executiveAttentionScoreLabel: "87",
            executiveAttentionLevel: "CRITICAL",
            executiveAttentionLevelLabel: "Crítica",
            executiveAttentionLevelVariant: "error",
            constructionHealthScoreLabel: "42",
            scheduleRiskLabel: "DELAY_RISK",
            href: "/projects/p1",
          },
        ]}
      />,
    );

    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByText("Crítica")).toBeInTheDocument();
  });
});
