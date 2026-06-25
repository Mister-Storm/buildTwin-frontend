import type {
  BenchmarkPositionDto,
  PortfolioBenchmarkSummaryDto,
  ProjectBenchmarkIntelligenceDto,
} from "@/features/benchmark-intelligence/benchmark-intelligence.api";

export const sampleHealthBenchmarkDto: BenchmarkPositionDto = {
  percentile: 91,
  band: "TOP_10",
  sampleSize: 18,
  scope: "PORTFOLIO",
};

export const sampleProductivityBenchmarkDto: BenchmarkPositionDto = {
  percentile: 72,
  band: "ABOVE_AVERAGE",
  sampleSize: 18,
  scope: "PORTFOLIO",
};

export const sampleWasteBenchmarkDto: BenchmarkPositionDto = {
  percentile: 45,
  band: "AVERAGE",
  sampleSize: 18,
  scope: "PORTFOLIO",
};

export const sampleProjectBenchmarksDto: ProjectBenchmarkIntelligenceDto = {
  healthBenchmark: sampleHealthBenchmarkDto,
  productivityBenchmark: sampleProductivityBenchmarkDto,
  wasteBenchmark: sampleWasteBenchmarkDto,
  scheduleBenchmark: null,
};

export const samplePortfolioBenchmarkSummaryDto: PortfolioBenchmarkSummaryDto = {
  healthDistribution: { p25: 65, p50: 72, p75: 81 },
  productivityDistribution: { p25: 0.04, p50: 0.58, p75: 0.71 },
  wasteDistribution: { p25: 60, p50: 70, p75: 80 },
  scheduleDistribution: { p25: 55, p50: 68, p75: 82 },
  totalProjectsUsed: 12,
};

export const emptyPortfolioBenchmarkSummaryDto: PortfolioBenchmarkSummaryDto = {
  healthDistribution: { p25: null, p50: null, p75: null },
  productivityDistribution: { p25: null, p50: null, p75: null },
  wasteDistribution: { p25: null, p50: null, p75: null },
  scheduleDistribution: { p25: null, p50: null, p75: null },
  totalProjectsUsed: 3,
};
