import type { ProjectTypeDto } from "@/types/api/project.api";

export const PROJECT_TYPE_OPTIONS: { value: ProjectTypeDto; label: string }[] = [
  { value: "RESIDENTIAL_BUILDING", label: "Edifício residencial" },
  { value: "COMMERCIAL_BUILDING", label: "Edifício comercial" },
  { value: "WAREHOUSE", label: "Galpão / armazém" },
  { value: "ROAD", label: "Rodovia" },
  { value: "BRIDGE", label: "Ponte" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "OTHER", label: "Outro" },
];

export function projectTypeLabel(type: ProjectTypeDto | null | undefined): string {
  if (!type) return "Não informado";
  return PROJECT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}
