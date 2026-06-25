import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mapBenchmarkPosition } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import { sampleHealthBenchmarkDto } from "@/features/benchmark-intelligence/benchmark-intelligence.test-fixtures";
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

  it("keeps absolute score visible when benchmark badge is present", () => {
    render(
      <ExecutiveHealthCard
        viewModel={{
          constructionHealthScoreLabel: "82",
          healthClassificationLabel: "Bom",
          healthClassificationVariant: "info",
          healthBenchmark: mapBenchmarkPosition(sampleHealthBenchmarkDto),
        }}
      />,
    );

    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Top 10%")).toBeInTheDocument();
  });
});
