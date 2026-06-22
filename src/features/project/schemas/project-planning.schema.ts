import { z } from "zod";

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
});

export type ProjectPlanningFormValues = z.infer<typeof projectPlanningSchema>;
