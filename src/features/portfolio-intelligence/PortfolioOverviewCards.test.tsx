import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortfolioOverviewCards } from "@/features/portfolio-intelligence/PortfolioOverviewCards";

describe("PortfolioOverviewCards", () => {
  it("renders four overview metrics", () => {
    render(
      <PortfolioOverviewCards
        cards={[
          { label: "Obras ativas", value: "2", subtitle: "3 no total" },
          { label: "Saúde média", value: "72,5" },
          { label: "Eficiência média", value: "81" },
          { label: "Progresso médio", value: "48,2" },
        ]}
      />,
    );

    expect(screen.getByText("Obras ativas")).toBeInTheDocument();
    expect(screen.getByText("Saúde média")).toBeInTheDocument();
    expect(screen.getByText("Eficiência média")).toBeInTheDocument();
    expect(screen.getByText("Progresso médio")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
