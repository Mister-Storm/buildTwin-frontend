import { describe, expect, it } from "vitest";
import {
  getWasteClassificationLabel,
  getWasteClassificationVariant,
} from "@/features/waste-intelligence/waste-classification.mapper";

describe("waste-classification.mapper", () => {
  it("maps warning classification", () => {
    expect(getWasteClassificationLabel("WARNING")).toBe("Atenção");
    expect(getWasteClassificationVariant("WARNING")).toBe("warning");
  });
});
