import { z } from "zod";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export const projectPlanningSchema = z.object({
  plannedAreaSquareMeters: z
    .union([
      z.literal(""),
      z.coerce.number().positive("Área planejada deve ser maior que zero"),
    ])
    .optional(),
  plannedFloors: z
    .union([
      z.literal(""),
      z.coerce.number().int().min(1, "Pavimentos deve ser pelo menos 1"),
    ])
    .optional(),
  projectType: z
    .enum([
      "RESIDENTIAL_BUILDING",
      "COMMERCIAL_BUILDING",
      "WAREHOUSE",
      "ROAD",
      "BRIDGE",
      "INDUSTRIAL",
      "OTHER",
      "",
    ])
    .optional(),
  plannedCompletionDate: z
    .union([
      z.literal(""),
      z.string().regex(dateOnlyPattern, "Data prevista inválida"),
    ])
    .optional(),
});

export type ProjectPlanningFormValues = z.infer<typeof projectPlanningSchema>;
