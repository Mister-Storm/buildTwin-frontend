import { describe, expect, it } from "vitest";
import {
  PlanningFieldParseError,
  parseOptionalPlannedArea,
  parseOptionalPlannedFloors,
  parseOptionalProjectType,
  planningAreaToInputValue,
  planningFloorsToInputValue,
  planningTypeToInputValue,
} from "@/features/project/planning-field-parsers";

describe("parseOptionalPlannedArea", () => {
  it("returns undefined for empty values", () => {
    expect(parseOptionalPlannedArea("")).toBeUndefined();
    expect(parseOptionalPlannedArea(undefined)).toBeUndefined();
  });

  it("parses positive numbers", () => {
    expect(parseOptionalPlannedArea("25000")).toBe(25000);
    expect(parseOptionalPlannedArea(1200.5)).toBe(1200.5);
  });

  it("rejects invalid and non-positive values", () => {
    expect(() => parseOptionalPlannedArea("abc")).toThrow(PlanningFieldParseError);
    expect(() => parseOptionalPlannedArea("0")).toThrow(PlanningFieldParseError);
    expect(() => parseOptionalPlannedArea("-10")).toThrow(PlanningFieldParseError);
  });
});

describe("parseOptionalPlannedFloors", () => {
  it("returns undefined for empty values", () => {
    expect(parseOptionalPlannedFloors("")).toBeUndefined();
  });

  it("parses positive integers", () => {
    expect(parseOptionalPlannedFloors("12")).toBe(12);
  });

  it("rejects invalid values", () => {
    expect(() => parseOptionalPlannedFloors("abc")).toThrow(PlanningFieldParseError);
    expect(() => parseOptionalPlannedFloors("0")).toThrow(PlanningFieldParseError);
    expect(() => parseOptionalPlannedFloors("2.5")).toThrow(PlanningFieldParseError);
  });
});

describe("parseOptionalProjectType", () => {
  it("returns undefined for empty values", () => {
    expect(parseOptionalProjectType("")).toBeUndefined();
    expect(parseOptionalProjectType(undefined)).toBeUndefined();
  });

  it("returns typed value", () => {
    expect(parseOptionalProjectType("WAREHOUSE")).toBe("WAREHOUSE");
  });
});

describe("planning input helpers", () => {
  it("maps nullable API values to form state", () => {
    expect(planningAreaToInputValue(null)).toBe("");
    expect(planningAreaToInputValue(25000)).toBe("25000");
    expect(planningFloorsToInputValue(3)).toBe("3");
    expect(planningTypeToInputValue("ROAD")).toBe("ROAD");
    expect(planningTypeToInputValue(null)).toBe("");
  });
});
