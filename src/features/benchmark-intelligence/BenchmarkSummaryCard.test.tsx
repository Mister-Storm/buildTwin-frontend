import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BenchmarkSummaryCard } from "@/features/benchmark-intelligence/BenchmarkSummaryCard";
import { mapPortfolioBenchmarkSummary } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import {
  emptyPortfolioBenchmarkSummaryDto,
  samplePortfolioBenchmarkSummaryDto,
} from "@/features/benchmark-intelligence/benchmark-intelligence.test-fixtures";

describe("BenchmarkSummaryCard", () => {
  it("renders quartile distributions for each dimension", () => {
    render(
      <BenchmarkSummaryCard
        viewModel={mapPortfolioBenchmarkSummary(samplePortfolioBenchmarkSummaryDto)}
      />,
    );

    expect(screen.getByText("Benchmarks da carteira")).toBeInTheDocument();
    expect(screen.getByText("Saúde")).toBeInTheDocument();
    expect(screen.getByText("Produtividade")).toBeInTheDocument();
    expect(screen.getAllByText("P25").length).toBeGreaterThan(0);
    expect(screen.getAllByText("P50").length).toBeGreaterThan(0);
    expect(screen.getAllByText("P75").length).toBeGreaterThan(0);
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("0,71")).toBeInTheDocument();
  });

  it("shows insufficient data message when sample is too small", () => {
    render(
      <BenchmarkSummaryCard
        viewModel={mapPortfolioBenchmarkSummary(emptyPortfolioBenchmarkSummaryDto)}
      />,
    );

    expect(
      screen.getAllByText("Dados insuficientes (mínimo 5 obras ativas).").length,
    ).toBeGreaterThan(0);
  });
});
