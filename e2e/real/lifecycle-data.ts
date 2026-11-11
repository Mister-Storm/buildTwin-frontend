import { z } from "zod";

const identity = z.object({ id: z.string().uuid(), email: z.string().regex(/^pilot-.*@example\.invalid$/) }).strict();
const project = z.object({ id: z.string().uuid(), name: z.string().startsWith("pilot-") }).strict();
const scenario = z.object({
  organizationId: z.string().uuid(),
  alpha: project,
  beta: project,
  gamma: project,
  subject: identity,
  administrator: identity,
  operator: identity,
  viewer: identity,
  unlinked: identity,
}).strict();
const manifest = z.object({
  kind: z.literal("buildtwin-disposable-authorization-v1"),
  cases: z.object({
    linked: scenario,
    downgrade: scenario,
    membership: scenario,
    reassignment: scenario,
    activation: scenario,
    unchanged: scenario,
  }),
}).strict().superRefine((value, context) => {
  const cases = Object.values(value.cases);
  if (new Set(cases.map((item) => item.organizationId)).size !== cases.length ||
      new Set(cases.map((item) => item.subject.id)).size !== cases.length) {
    context.addIssue({ code: "custom", message: "Lifecycle cases require independent disposable scopes" });
  }
});

export type LifecycleIdentity = z.infer<typeof identity>;
export type LifecycleScenario = z.infer<typeof scenario>;

export function resolveLifecycleFixtures(environment: Record<string, string | undefined>) {
  try {
    const encoded = environment.BUILDTWIN_REAL_AUTH_FIXTURES;
    const password = environment.BUILDTWIN_REAL_USER_PASSWORD;
    if (!encoded || !password) throw new Error("Missing disposable fixture configuration");
    const parsed = manifest.safeParse(JSON.parse(encoded));
    if (!parsed.success) throw new Error("Invalid disposable fixture configuration");
    return { ...parsed.data, password };
  } catch {
    throw new Error("Identifiable disposable lifecycle fixtures are required; credentials redacted");
  }
}


const deliveryArtifact = z.object({ jobId: z.string().uuid(), id: z.string().uuid(), sha256: z.string().regex(/^[a-f0-9]{64}$/), byteLength: z.number().int().positive() }).strict();
const delivery = scenario.extend({
  platform: identity,
  sessionId: z.string().uuid(),
  imageBase64: z.string().min(1),
  preview: deliveryArtifact,
  raw: deliveryArtifact,
  unassignedPreview: deliveryArtifact,
  foreignPreview: deliveryArtifact,
}).strict();

export function resolveDeliveryFixtures(environment: Record<string, string | undefined>) {
  try {
    return delivery.parse(JSON.parse(environment.BUILDTWIN_REAL_DELIVERY_FIXTURES ?? ""));
  } catch {
    throw new Error("Identifiable disposable delivery fixtures are required; credentials redacted");
  }
}
