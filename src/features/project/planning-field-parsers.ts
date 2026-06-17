import type { ProjectTypeDto } from "@/types/api/project.api";

export function parseOptionalPlannedArea(
  value: string | number | undefined,
): number | null | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  return typeof value === "number" ? value : Number(value);
}

export function parseOptionalPlannedFloors(
  value: string | number | undefined,
): number | null | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  return typeof value === "number" ? value : Number(value);
}

export function parseOptionalProjectType(
  value: string | undefined,
): ProjectTypeDto | null | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  return value as ProjectTypeDto;
}
