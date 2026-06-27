import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HotspotCard } from "@/features/spatial-intelligence/HotspotCard";

describe("HotspotCard", () => {
  it("renders hotspot summaries with severity badges", () => {
    render(
      <HotspotCard
        hotspots={[
          {
            regionLabel: "Norte",
            metricLabel: "Resíduos",
            severityLabel: "Alto",
            severityVariant: "warning",
            summary: "Alta concentração de resíduos",
            valueLabel: "75.0",
          },
        ]}
      />,
    );

    expect(screen.getByText("Hotspots espaciais")).toBeInTheDocument();
    expect(screen.getByText("Resíduos — Norte")).toBeInTheDocument();
    expect(screen.getByText("Alta concentração de resíduos")).toBeInTheDocument();
    expect(screen.getByText("Alto")).toBeInTheDocument();
  });
});
