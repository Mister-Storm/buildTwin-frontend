import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  address: z.string().trim().min(1, "Endereço é obrigatório"),
  city: z.string().trim().min(1, "Cidade é obrigatória"),
  state: z.string().trim().min(1, "Estado é obrigatório"),
  country: z.string().trim().min(1, "País é obrigatório"),
  latitude: z.coerce
    .number({ message: "Latitude inválida" })
    .min(-90, "Latitude mínima: -90")
    .max(90, "Latitude máxima: 90"),
  longitude: z.coerce
    .number({ message: "Longitude inválida" })
    .min(-180, "Longitude mínima: -180")
    .max(180, "Longitude máxima: 180"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
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

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export function validateStartDateNotTooFarFuture(startDate: string): string | null {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return "Data inválida";
  const max = new Date();
  max.setFullYear(max.getFullYear() + 5);
  if (date > max) return "Data não pode ser mais de 5 anos no futuro";
  return null;
}

export const createFlightSchema = z.object({
  flightDate: z.string().min(1, "Data do voo é obrigatória"),
  operatorName: z
    .string()
    .trim()
    .min(1, "Nome do operador é obrigatório"),
});

export type CreateFlightFormValues = z.infer<typeof createFlightSchema>;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 100 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Formato não suportado. Use JPG ou PNG.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Arquivo excede 100MB.";
  }
  if (file.size === 0) {
    return "Arquivo vazio.";
  }
  return null;
}
