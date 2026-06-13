import { describe, expect, it } from "vitest";
import {
  flightStatusLabel,
  flightStatusVariant,
  formatFileSize,
  jobStatusVariant,
  projectStatusLabel,
} from "@/lib/formatters";

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

describe("flightStatusLabel", () => {
  it("translates COMPLETED to pt-BR", () => {
    expect(flightStatusLabel("COMPLETED")).toBe("Concluído");
  });

  it("falls back to raw status for unknown values", () => {
    expect(flightStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});
