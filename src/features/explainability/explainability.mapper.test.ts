import { describe, expect, it } from "vitest";
import { mapExplanationSeverityVariant } from "@/features/explainability/explainability.mapper";

describe("explainability.mapper", () => {
  it("maps explanation severity variants", () => {
    expect(mapExplanationSeverityVariant("POSITIVE")).toBe("success");
    expect(mapExplanationSeverityVariant("NEUTRAL")).toBe("neutral");
    expect(mapExplanationSeverityVariant("WARNING")).toBe("warning");
    expect(mapExplanationSeverityVariant("CRITICAL")).toBe("error");
  });
});
