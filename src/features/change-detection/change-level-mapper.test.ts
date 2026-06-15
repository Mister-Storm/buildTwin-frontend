import { describe, expect, it } from "vitest";
import {
  getChangeLevelLabel,
  getChangeLevelVariant,
  getComparisonQualityLabel,
} from "@/features/change-detection/change-level-mapper";

describe("change-level-mapper", () => {
  it("maps all change levels to pt-BR labels", () => {
    expect(getChangeLevelLabel("VERY_LOW")).toBe("Muito baixa");
    expect(getChangeLevelLabel("LOW")).toBe("Baixa");
    expect(getChangeLevelLabel("MODERATE")).toBe("Moderada");
    expect(getChangeLevelLabel("HIGH")).toBe("Alta");
    expect(getChangeLevelLabel("VERY_HIGH")).toBe("Muito alta");
  });

  it("assigns variants for change levels", () => {
    expect(getChangeLevelVariant("VERY_LOW")).toBe("neutral");
    expect(getChangeLevelVariant("VERY_HIGH")).toBe("error");
  });

  it("maps comparison quality labels", () => {
    expect(getComparisonQualityLabel("NORMAL")).toBe("Normal");
    expect(getComparisonQualityLabel("LOW")).toBe("Baixa");
  });
});
