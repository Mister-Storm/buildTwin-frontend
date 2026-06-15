import { describe, expect, it } from "vitest";
import { generateProgressInsight } from "@/features/progress-intelligence/progress-insight-generator";

describe("generateProgressInsight", () => {
  it("returns deterministic insight for each classification", () => {
    expect(generateProgressInsight("LOW")).toBe(
      "Pouca evolução visual identificada entre os levantamentos.",
    );
    expect(generateProgressInsight("MEDIUM")).toBe(
      "Evolução consistente observada no período analisado.",
    );
    expect(generateProgressInsight("HIGH")).toBe(
      "Grande volume de alterações detectado no período.",
    );
  });
});
