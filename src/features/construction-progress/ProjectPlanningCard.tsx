"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { PROJECT_TYPE_OPTIONS } from "@/features/project/project-type-options";
import {
  parseOptionalPlannedArea,
  parseOptionalPlannedFloors,
  parseOptionalProjectType,
} from "@/features/project/planning-field-parsers";
import { updateProject } from "@/services/projects.service";
import type { ProjectResponseDto, ProjectTypeDto } from "@/types/api/project.api";
import { ApiError } from "@/types/api/common.api";
import { Target } from "lucide-react";

type ProjectPlanningCardProps = {
  project: ProjectResponseDto;
};

export function ProjectPlanningCard({ project }: ProjectPlanningCardProps) {
  const router = useRouter();
  const [plannedArea, setPlannedArea] = useState(
    project.plannedAreaSquareMeters?.toString() ?? "",
  );
  const [plannedFloors, setPlannedFloors] = useState(
    project.plannedFloors?.toString() ?? "",
  );
  const [projectType, setProjectType] = useState<ProjectTypeDto | "">(
    project.projectType ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await updateProject(project.id, {
        name: project.name,
        startDate: project.startDate,
        location: project.location,
        plannedAreaSquareMeters: parseOptionalPlannedArea(plannedArea) ?? null,
        plannedFloors: parseOptionalPlannedFloors(plannedFloors) ?? null,
        projectType: parseOptionalProjectType(projectType) ?? null,
      });
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : "Não foi possível salvar o planejamento.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="size-5 text-brand-accent" />
          Planejamento da Obra
        </CardTitle>
        <CardDescription>
          Metas informadas para estimativa de conclusão com base na área observada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Área planejada (m²)" htmlFor="plannedArea">
            <Input
              id="plannedArea"
              type="number"
              min="0"
              step="any"
              placeholder="Ex.: 25000"
              value={plannedArea}
              onChange={(event) => setPlannedArea(event.target.value)}
            />
          </FormField>
          <FormField label="Pavimentos previstos" htmlFor="plannedFloors">
            <Input
              id="plannedFloors"
              type="number"
              min="1"
              step="1"
              placeholder="Ex.: 12"
              value={plannedFloors}
              onChange={(event) => setPlannedFloors(event.target.value)}
            />
          </FormField>
          <FormField label="Tipo de obra" htmlFor="projectType">
            <select
              id="projectType"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              value={projectType}
              onChange={(event) =>
                setProjectType(event.target.value as ProjectTypeDto | "")
              }
            >
              <option value="">Não informado</option>
              {PROJECT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          {error ? (
            <p className="text-sm text-destructive sm:col-span-2 lg:col-span-3" role="alert">
              {error}
            </p>
          ) : null}
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar planejamento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
