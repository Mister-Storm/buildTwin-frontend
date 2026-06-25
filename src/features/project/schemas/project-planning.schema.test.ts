import { describe, expect, it } from "vitest";
import { projectPlanningSchema } from "@/features/project/schemas/project-planning.schema";

describe("projectPlanningSchema", () => {
  it("accepts optional planned completion date", () => {
    const result = projectPlanningSchema.safeParse({
      plannedAreaSquareMeters: "10000",
      plannedFloors: "12",
      projectType: "RESIDENTIAL_BUILDING",
      plannedCompletionDate: "2027-12-31",
    });

    expect(result.success).toBe(true);
  });

  it("accepts empty planned completion date", () => {
    const result = projectPlanningSchema.safeParse({
      plannedCompletionDate: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid planned completion date format", () => {
    const result = projectPlanningSchema.safeParse({
      plannedCompletionDate: "2027-6-12",
    });

    expect(result.success).toBe(false);
  });
});
