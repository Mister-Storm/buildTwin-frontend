import { describe, expect, it } from "vitest";
import {
  flightStatusLabel,
  flightStatusVariant,
  formatDate,
  formatAreaDelta,
  formatFileSize,
  formatGrowthRate,
  formatPercent,
  jobStatusVariant,
  parseDateOnly,
  projectStatusLabel,
} from "@/lib/formatters";

describe("parseDateOnly", () => {
  it("parses YYYY-MM-DD as a local calendar date", () => {
    const date = parseDateOnly("2026-06-12");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(12);
  });

  it("formats parsed API dates consistently in pt-BR", () => {
    expect(formatDate(parseDateOnly("2026-06-12"))).toBe("12 de jun. de 2026");
  });

  it("rejects malformed date strings", () => {
    expect(() => parseDateOnly("2026-6-12")).toThrow(/Invalid date-only string/);
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});

describe("flightStatusVariant", () => {
  it("maps COMPLETED to success", () => {
    expect(flightStatusVariant("COMPLETED")).toBe("success");
  });

  it("maps FAILED to error", () => {
    expect(flightStatusVariant("FAILED")).toBe("error");
  });

  it("maps PROCESSING to warning", () => {
    expect(flightStatusVariant("PROCESSING")).toBe("warning");
  });
});

describe("jobStatusVariant", () => {
  it("maps COMPLETED to success", () => {
    expect(jobStatusVariant("COMPLETED")).toBe("success");
  });

  it("maps FAILED to error", () => {
    expect(jobStatusVariant("FAILED")).toBe("error");
  });

  it("maps null to neutral", () => {
    expect(jobStatusVariant(null)).toBe("neutral");
  });
});

describe("projectStatusLabel", () => {
  it("returns Ativa for active projects", () => {
    expect(projectStatusLabel(false)).toBe("Ativa");
  });

  it("returns Arquivada for archived projects", () => {
    expect(projectStatusLabel(true)).toBe("Arquivada");
  });
});

describe("progress formatters", () => {
  it("formats signed area delta in pt-BR", () => {
    expect(formatAreaDelta(1191)).toBe("+1.191 m²");
    expect(formatAreaDelta(-350)).toBe("−350 m²");
    expect(formatAreaDelta(null)).toBe("Não disponível");
  });

  it("formats signed percent in pt-BR", () => {
    expect(formatPercent(16.4)).toBe("+16,4%");
    expect(formatPercent(-2.1)).toBe("−2,1%");
    expect(formatPercent(null)).toBe("Não disponível");
  });

  it("formats growth rate in pt-BR", () => {
    expect(formatGrowthRate(37.2)).toBe("37,2 m²/dia");
    expect(formatGrowthRate(null)).toBe("Não disponível");
  });
});

describe("flightStatusLabel", () => {
  it("translates COMPLETED to pt-BR", () => {
    expect(flightStatusLabel("COMPLETED")).toBe("Concluído");
  });

  it("falls back to raw status for unknown values", () => {
    expect(flightStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});
