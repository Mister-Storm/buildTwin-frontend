import { describe, expect, it } from "vitest";
import { mapOrthomosaicSurveyFields } from "@/features/orthomosaic-viewer/orthomosaic-metadata.mapper";
import { parseDateOnly } from "@/lib/formatters";

describe("mapOrthomosaicSurveyFields", () => {
  const fullMetadata = {
    format: "GeoTIFF",
    width: 12000,
    height: 9000,
    crs: "EPSG:31982",
    epsg: 31982,
    centerLat: -27.61234,
    centerLon: -48.63214,
    bounds: {
      minLat: -27.615,
      maxLat: -27.609,
      minLon: -48.635,
      maxLon: -48.629,
    },
    areaSquareMeters: 8421.4,
    gsdCmPerPixel: 2.1,
  };

  it("maps full orthomosaic metadata and flight date", () => {
    const fields = mapOrthomosaicSurveyFields(
      fullMetadata,
      parseDateOnly("2026-06-12"),
    );

    expect(fields.captureDateLabel).toBe("12 de jun. de 2026");
    expect(fields.areaLabel).toBe("8.421,4 m²");
    expect(fields.gsdLabel).toBe("2,1 cm/pixel");
    expect(fields.crs).toBe("EPSG:31982");
    expect(fields.dimensionsLabel).toBe("12.000 × 9.000 px");
    expect(fields.epsg).toBe(31982);
    expect(fields.centerLat).toBe(-27.61234);
    expect(fields.bounds?.minLat).toBe(-27.615);
  });

  it("returns unavailable labels when metadata is empty", () => {
    const fields = mapOrthomosaicSurveyFields({}, null);

    expect(fields.captureDateLabel).toBe("Não disponível");
    expect(fields.areaLabel).toBe("Não disponível");
    expect(fields.gsdLabel).toBe("Não disponível");
    expect(fields.crs).toBe("Não disponível");
    expect(fields.dimensionsLabel).toBe("Não disponível");
    expect(fields.epsg).toBeNull();
    expect(fields.bounds).toBeNull();
  });

  it("ignores partial bounds objects", () => {
    const fields = mapOrthomosaicSurveyFields(
      { bounds: { minLat: -27.615 } },
      parseDateOnly("2026-06-12"),
    );

    expect(fields.bounds).toBeNull();
  });

  it("ignores non-numeric metadata values", () => {
    const fields = mapOrthomosaicSurveyFields(
      {
        width: "12000",
        height: null,
        areaSquareMeters: "8421.4",
        gsdCmPerPixel: undefined,
        epsg: "31982",
      },
      parseDateOnly("2026-06-12"),
    );

    expect(fields.width).toBeNull();
    expect(fields.height).toBeNull();
    expect(fields.areaLabel).toBe("Não disponível");
    expect(fields.gsdLabel).toBe("Não disponível");
    expect(fields.dimensionsLabel).toBe("Não disponível");
    expect(fields.epsg).toBeNull();
  });
});
