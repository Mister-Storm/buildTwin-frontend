import type { ProjectTypeDto } from "@/types/api/project.api";

export class PlanningFieldParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanningFieldParseError";
  }
}

export function parseOptionalPlannedArea(
  value: string | number | undefined,
): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) {
    throw new PlanningFieldParseError("Área planejada inválida");
  }
  if (parsed <= 0) {
    throw new PlanningFieldParseError("Área planejada deve ser maior que zero");
  }

  return parsed;
}

export function parseOptionalPlannedFloors(
  value: string | number | undefined,
): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed)) {
    throw new PlanningFieldParseError("Pavimentos deve ser um número inteiro");
  }
  if (parsed < 1) {
    throw new PlanningFieldParseError("Pavimentos deve ser pelo menos 1");
  }

  return parsed;
}

export function parseOptionalProjectType(
  value: string | undefined,
): ProjectTypeDto | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  return value as ProjectTypeDto;
}

export function planningAreaToInputValue(value: number | null | undefined): string {
  return value?.toString() ?? "";
}

export function planningFloorsToInputValue(value: number | null | undefined): string {
  return value?.toString() ?? "";
}

export function planningTypeToInputValue(
  value: ProjectTypeDto | null | undefined,
): ProjectTypeDto | "" {
  return value ?? "";
}
