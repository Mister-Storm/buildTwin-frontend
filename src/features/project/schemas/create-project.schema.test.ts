import { describe, expect, it } from "vitest";
import {
  createProjectSchema,
  createFlightSchema,
  validateImageFile,
} from "@/features/project/schemas/create-project.schema";

describe("createProjectSchema", () => {
  it("accepts valid project input", () => {
    const result = createProjectSchema.safeParse({
      name: "Obra Teste",
      address: "Rua 1",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      latitude: -23.5,
      longitude: -46.6,
      startDate: "2026-01-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = createProjectSchema.safeParse({
      name: "A",
      address: "Rua 1",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      latitude: 0,
      longitude: 0,
      startDate: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("createFlightSchema", () => {
  it("requires operator name", () => {
    const result = createFlightSchema.safeParse({
      flightDate: "2026-06-12",
      operatorName: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("validateImageFile", () => {
  it("rejects unsupported type", () => {
    const file = new File(["x"], "doc.pdf", { type: "application/pdf" });
    expect(validateImageFile(file)).toMatch(/Formato/);
  });
});
