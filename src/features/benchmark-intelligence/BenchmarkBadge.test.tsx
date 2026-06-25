import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BenchmarkBadge } from "@/features/benchmark-intelligence/BenchmarkBadge";
import { mapBenchmarkPosition } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import { sampleHealthBenchmarkDto } from "@/features/benchmark-intelligence/benchmark-intelligence.test-fixtures";

describe("BenchmarkBadge", () => {
  it("renders supplemental badge alongside absolute context without replacing score", () => {
    render(
      <div>
        <span data-testid="absolute-score">82</span>
        <BenchmarkBadge benchmark={mapBenchmarkPosition(sampleHealthBenchmarkDto)} />
      </div>,
    );

    expect(screen.getByTestId("absolute-score")).toHaveTextContent("82");
    expect(screen.getByText("Top 10%")).toBeInTheDocument();
  });

  it("renders nothing when benchmark is unavailable", () => {
    const { container } = render(
      <div>
        <span>82</span>
        <BenchmarkBadge benchmark={null} />
      </div>,
    );

    expect(screen.getByText("82")).toBeInTheDocument();
    expect(container.querySelector('[class*="badge"]')).toBeNull();
  });
});
