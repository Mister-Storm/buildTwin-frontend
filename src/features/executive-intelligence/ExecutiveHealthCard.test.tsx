import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutiveHealthCard } from "@/features/executive-intelligence/ExecutiveHealthCard";

describe("ExecutiveHealthCard", () => {
  it("renders health score and classification badge", () => {
    render(
      <ExecutiveHealthCard
        viewModel={{
          constructionHealthScoreLabel: "87",
          healthClassificationLabel: "Bom",
          healthClassificationVariant: "info",
        }}
      />,
    );

    expect(screen.getByText("Saúde da Obra")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByText("Bom")).toBeInTheDocument();
  });
});
