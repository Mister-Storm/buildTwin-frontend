"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { NativeSelect } from "@/components/shared/NativeSelect";
import { PROJECT_TYPE_OPTIONS } from "@/features/project/project-type-options";
import {
  PlanningFieldParseError,
  parseOptionalPlannedArea,
  parseOptionalPlannedFloors,
  parseOptionalProjectType,
  planningAreaToInputValue,
  planningFloorsToInputValue,
  planningTypeToInputValue,
} from "@/features/project/planning-field-parsers";
import { projectPlanningSchema } from "@/features/project/schemas/project-planning.schema";
import { updateProject } from "@/services/projects.service";
import type { ProjectResponseDto, ProjectTypeDto } from "@/types/api/project.api";
import { ApiError } from "@/types/api/common.api";
import { Target } from "lucide-react";

type ProjectPlanningCardProps = {
  project: ProjectResponseDto;
};

function syncPlanningStateFromProject(project: ProjectResponseDto) {
  return {
    plannedArea: planningAreaToInputValue(project.plannedAreaSquareMeters),
    plannedFloors: planningFloorsToInputValue(project.plannedFloors),
    projectType: planningTypeToInputValue(project.projectType),
  };
}

export function ProjectPlanningCard({ project }: ProjectPlanningCardProps) {
  const router = useRouter();
  const [plannedArea, setPlannedArea] = useState(
    () => planningAreaToInputValue(project.plannedAreaSquareMeters),
  );
  const [plannedFloors, setPlannedFloors] = useState(
    () => planningFloorsToInputValue(project.plannedFloors),
  );
  const [projectType, setProjectType] = useState<ProjectTypeDto | "">(
    () => planningTypeToInputValue(project.projectType),
  );
  const [fieldErrors, setFieldErrors] = useState<{
    plannedArea?: string;
    plannedFloors?: string;
    projectType?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const next = syncPlanningStateFromProject(project);
    setPlannedArea(next.plannedArea);
    setPlannedFloors(next.plannedFloors);
    setProjectType(next.projectType);
  }, [project]);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  function applyProjectResponse(updated: ProjectResponseDto) {
    const next = syncPlanningStateFromProject(updated);
    setPlannedArea(next.plannedArea);
    setPlannedFloors(next.plannedFloors);
    setProjectType(next.projectType);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({});
    setIsSaving(true);

    const parsed = projectPlanningSchema.safeParse({
      plannedAreaSquareMeters: plannedArea,
      plannedFloors: plannedFloors,
      projectType,
    });

    if (!parsed.success) {
      const errors: {
        plannedArea?: string;
        plannedFloors?: string;
        projectType?: string;
      } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "plannedAreaSquareMeters" && !errors.plannedArea) {
          errors.plannedArea = issue.message;
        }
        if (key === "plannedFloors" && !errors.plannedFloors) {
          errors.plannedFloors = issue.message;
        }
        if (key === "projectType" && !errors.projectType) {
          errors.projectType = issue.message;
        }
      }
      setFieldErrors(errors);
      setIsSaving(false);
      return;
    }

    try {
      const updated = await updateProject(project.id, {
        name: project.name,
        startDate: project.startDate,
        location: project.location,
        plannedAreaSquareMeters: parseOptionalPlannedArea(plannedArea) ?? null,
        plannedFloors: parseOptionalPlannedFloors(plannedFloors) ?? null,
        projectType: parseOptionalProjectType(projectType) ?? null,
      });
      applyProjectResponse(updated);
      setSuccessMessage("Planejamento salvo com sucesso.");
      router.refresh();
    } catch (saveError) {
      if (saveError instanceof PlanningFieldParseError) {
        setError(saveError.message);
      } else {
        setError(
          saveError instanceof ApiError
            ? saveError.message
            : "Não foi possível salvar o planejamento.",
        );
      }
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
          <FormField
            label="Área planejada (m²)"
            htmlFor="plannedArea"
            error={fieldErrors.plannedArea}
          >
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
          <FormField
            label="Pavimentos previstos"
            htmlFor="plannedFloors"
            error={fieldErrors.plannedFloors}
          >
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
          <FormField
            label="Tipo de obra"
            htmlFor="projectType"
            error={fieldErrors.projectType}
          >
            <NativeSelect
              id="projectType"
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
            </NativeSelect>
          </FormField>
          {successMessage ? (
            <p
              className="text-sm text-brand-success sm:col-span-2 lg:col-span-3"
              role="status"
            >
              {successMessage}
            </p>
          ) : null}
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
