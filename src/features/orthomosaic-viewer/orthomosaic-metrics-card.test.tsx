import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrthomosaicMetricsCard } from "@/features/orthomosaic-viewer/OrthomosaicMetricsCard";
import type { OrthomosaicViewModel } from "@/features/domain/models/orthomosaic";

function buildViewModel(
  overrides: Partial<OrthomosaicViewModel> = {},
): OrthomosaicViewModel {
  return {
    projectId: "proj-1",
    captureSessionId: "flight-1",
    jobId: "job-1",
    previewArtifactId: "preview-1",
    downloadArtifactId: "ortho-1",
    previewUrl: "/preview",
    downloadUrl: "/download",
    captureDate: new Date("2026-06-14"),
    operatorName: "Operador",
    jobStatus: "Concluído",
    jobStatusVariant: "success",
    fileSizeBytes: 512000,
    fileSizeLabel: "500.0 KB",
    processedAt: new Date("2026-06-14T11:00:00Z"),
    width: 12000,
    height: 9000,
    captureDateLabel: "14 de jun. de 2026",
    areaLabel: "8.421,4 m²",
    gsdLabel: "2,1 cm/pixel",
    crs: "EPSG:31982",
    dimensionsLabel: "12.000 × 9.000 px",
    epsg: 31982,
    centerLat: -27.61234,
    centerLon: -48.63214,
    bounds: {
      minLat: -27.615,
      maxLat: -27.609,
      minLon: -48.635,
      maxLon: -48.629,
    },
    ...overrides,
  };
}

describe("OrthomosaicMetricsCard", () => {
  it("renders survey metrics including capture date", () => {
    render(<OrthomosaicMetricsCard viewModel={buildViewModel()} />);

    expect(screen.getByText("Levantamento")).toBeInTheDocument();
    expect(screen.getByText("Data do Levantamento")).toBeInTheDocument();
    expect(screen.getByText("14 de jun. de 2026")).toBeInTheDocument();
    expect(screen.getByText("8.421,4 m²")).toBeInTheDocument();
    expect(screen.getByText("2,1 cm/pixel")).toBeInTheDocument();
    expect(screen.getByText("EPSG:31982")).toBeInTheDocument();
    expect(screen.getByText("12.000 × 9.000 px")).toBeInTheDocument();
  });

  it("shows unavailable fallbacks for missing geospatial fields", () => {
    render(
      <OrthomosaicMetricsCard
        viewModel={buildViewModel({
          captureDateLabel: "Não disponível",
          areaLabel: "Não disponível",
          gsdLabel: "Não disponível",
          crs: "Não disponível",
          dimensionsLabel: "Não disponível",
        })}
      />,
    );

    expect(screen.getAllByText("Não disponível")).toHaveLength(5);
  });

  it("does not expose hidden geospatial fields in the DOM", () => {
    render(<OrthomosaicMetricsCard viewModel={buildViewModel()} />);

    expect(screen.queryByText("31982")).not.toBeInTheDocument();
    expect(screen.queryByText("-27.61234")).not.toBeInTheDocument();
    expect(screen.queryByText("-48.63214")).not.toBeInTheDocument();
    expect(screen.queryByText("-27.615")).not.toBeInTheDocument();
  });
});
