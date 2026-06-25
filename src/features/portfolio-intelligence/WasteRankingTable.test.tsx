import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WasteRankingTable } from "@/features/portfolio-intelligence/WasteRankingTable";

describe("WasteRankingTable", () => {
  it("renders ranking rows with project links", () => {
    render(
      <WasteRankingTable
        rows={[
          {
            rank: 1,
            projectId: "p1",
            projectName: "Alpha",
            metricLabel: "85",
            href: "/projects/p1",
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "Alpha" });
    expect(link).toHaveAttribute("href", "/projects/p1");
    expect(screen.getByText("85")).toBeInTheDocument();
  });
});
