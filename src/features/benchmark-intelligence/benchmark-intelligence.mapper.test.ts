import { describe, expect, it } from "vitest";
import {
  mapBenchmarkBandLabel,
  mapBenchmarkBandVariant,
  mapBenchmarkPosition,
  mapPortfolioBenchmarkSummary,
  mapProjectBenchmarkIntelligence,
} from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import {
  emptyPortfolioBenchmarkSummaryDto,
  sampleHealthBenchmarkDto,
  samplePortfolioBenchmarkSummaryDto,
  sampleProjectBenchmarksDto,
} from "@/features/benchmark-intelligence/benchmark-intelligence.test-fixtures";

describe("benchmark-intelligence.mapper", () => {
  it("maps benchmark band labels and variants", () => {
    expect(mapBenchmarkBandLabel("TOP_10")).toBe("Top 10%");
    expect(mapBenchmarkBandLabel("BOTTOM_10")).toBe("10% piores");
    expect(mapBenchmarkBandVariant("TOP_10")).toBe("success");
    expect(mapBenchmarkBandVariant("BOTTOM_10")).toBe("error");
  });

  it("maps benchmark position view model", () => {
    const viewModel = mapBenchmarkPosition(sampleHealthBenchmarkDto);

    expect(viewModel.bandLabel).toBe("Top 10%");
    expect(viewModel.percentile).toBe(91);
    expect(viewModel.sampleSize).toBe(18);
    expect(viewModel.detailSummary).toContain("Percentil 91");
  });

  it("maps project benchmark intelligence", () => {
    const viewModel = mapProjectBenchmarkIntelligence(sampleProjectBenchmarksDto);

    expect(viewModel.healthBenchmark?.bandLabel).toBe("Top 10%");
    expect(viewModel.productivityBenchmark?.bandLabel).toBe("Acima da média");
    expect(viewModel.scheduleBenchmark).toBeNull();
  });

  it("maps portfolio benchmark summary quartiles", () => {
    const viewModel = mapPortfolioBenchmarkSummary(samplePortfolioBenchmarkSummaryDto);

    expect(viewModel.hasSufficientSample).toBe(true);
    expect(viewModel.health.p50Label).toBe("72");
    expect(viewModel.productivity.p75Label).toBe("0,71");
    expect(viewModel.totalProjectsUsed).toBe(12);
  });

  it("marks insufficient sample when fewer than five projects", () => {
    const viewModel = mapPortfolioBenchmarkSummary(emptyPortfolioBenchmarkSummaryDto);

    expect(viewModel.hasSufficientSample).toBe(false);
    expect(viewModel.health.hasData).toBe(false);
    expect(viewModel.health.p50Label).toBe("—");
  });
});
