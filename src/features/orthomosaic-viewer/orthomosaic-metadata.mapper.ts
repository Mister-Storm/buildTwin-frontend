import type {
  OrthomosaicBounds,
  OrthomosaicViewModel,
} from "@/features/domain/models/orthomosaic";
import { formatDate } from "@/lib/formatters";

const UNAVAILABLE = "Não disponível";

function readMetadataNumber(
  metadata: Record<string, unknown>,
  key: string,
): number | null {
  const value = metadata[key];
  return typeof value === "number" ? value : null;
}

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readBounds(
  metadata: Record<string, unknown>,
): OrthomosaicBounds | null {
  const raw = metadata.bounds;
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const bounds = raw as Record<string, unknown>;
  const minLat = readMetadataNumber(bounds, "minLat");
  const maxLat = readMetadataNumber(bounds, "maxLat");
  const minLon = readMetadataNumber(bounds, "minLon");
  const maxLon = readMetadataNumber(bounds, "maxLon");
  if (
    minLat === null ||
    maxLat === null ||
    minLon === null ||
    maxLon === null
  ) {
    return null;
  }
  return { minLat, maxLat, minLon, maxLon };
}

function formatAreaLabel(areaSquareMeters: number | null): string | null {
  if (areaSquareMeters === null) {
    return UNAVAILABLE;
  }
  return `${areaSquareMeters.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })} m²`;
}

function formatGsdLabel(gsdCmPerPixel: number | null): string | null {
  if (gsdCmPerPixel === null) {
    return UNAVAILABLE;
  }
  return `${gsdCmPerPixel.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} cm/pixel`;
}

function formatDimensionsLabel(
  width: number | null,
  height: number | null,
): string | null {
  if (width === null || height === null) {
    return UNAVAILABLE;
  }
  return `${width.toLocaleString("pt-BR")} × ${height.toLocaleString("pt-BR")} px`;
}

export function mapOrthomosaicSurveyFields(
  metadata: Record<string, unknown>,
  captureDate: Date | null,
): Pick<
  OrthomosaicViewModel,
  | "captureDateLabel"
  | "areaLabel"
  | "gsdLabel"
  | "crs"
  | "dimensionsLabel"
  | "width"
  | "height"
  | "epsg"
  | "centerLat"
  | "centerLon"
  | "bounds"
> {
  const width = readMetadataNumber(metadata, "width");
  const height = readMetadataNumber(metadata, "height");
  const areaSquareMeters = readMetadataNumber(metadata, "areaSquareMeters");
  const gsdCmPerPixel = readMetadataNumber(metadata, "gsdCmPerPixel");

  return {
    captureDateLabel: captureDate ? formatDate(captureDate) : UNAVAILABLE,
    areaLabel: formatAreaLabel(areaSquareMeters),
    gsdLabel: formatGsdLabel(gsdCmPerPixel),
    crs: readMetadataString(metadata, "crs") ?? UNAVAILABLE,
    dimensionsLabel: formatDimensionsLabel(width, height),
    width,
    height,
    epsg: readMetadataNumber(metadata, "epsg"),
    centerLat: readMetadataNumber(metadata, "centerLat"),
    centerLon: readMetadataNumber(metadata, "centerLon"),
    bounds: readBounds(metadata),
  };
}
