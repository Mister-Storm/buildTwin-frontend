import type { APIResponse, Browser, Page } from "@playwright/test";
import { z } from "zod";
import { test, expect } from "./fixtures";
import { resolveRealBrowserEnvironment } from "./environment";

const identity = z.object({ id: z.string().uuid(), email: z.string().regex(/^pilot-.*@example\.invalid$/) });
const manifest = z.object({
  kind: z.literal("buildtwin-disposable-artifact-delivery-v1"),
  alpha: z.object({ id: z.string().uuid(), name: z.string().startsWith("pilot-") }),
  capabilityViewer: identity,
  operator: identity,
  sessionA: z.string().uuid(),
  sessionB: z.string().uuid(),
  digitalTwinEnabled: z.literal(false),
});
type Identity = z.infer<typeof identity>;

const environment = resolveRealBrowserEnvironment(process.env);
const detectors = [
  { capability: "BUILT_AREA_DETECTION", route: "built-area/detect", button: "Detectar Área com IA" },
  { capability: "MATERIAL_INVENTORY_DETECTION", route: "inventory/detect", button: "Detectar Materiais com IA" },
  { capability: "VERTICAL_CONSTRUCTION_DETECTION", route: "vertical-construction/detect", button: "Detectar Pavimentos com IA" },
] as const;
const numericOutputs = ["detectedAreaSquareMeters", "confidenceScore", "detectedFloors", "estimatedHeightMeters", "items", "detections"];
test.setTimeout(240_000);

function resolveFixture() {
  const raw = process.env.BUILDTWIN_REAL_ARTIFACT_FIXTURES;
  const password = process.env.BUILDTWIN_REAL_USER_PASSWORD;
  if (!raw || !password) throw new Error("Disposable capability fixtures are required");
  return { ...manifest.parse(JSON.parse(raw)), password };
}

async function signIn(browser: Browser, user: Identity, password: string): Promise<Page> {
  const context = await browser.newContext({ baseURL: environment.baseURL });
  const page = await context.newPage();
  try {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(user.email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    const response = page.waitForResponse(value => value.url().endsWith("/api/v1/auth/login") && value.request().method() === "POST");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    expect((await response).status()).toBe(200);
    await page.waitForURL(/\/(admin|dashboard)(?:[/?#]|$)/);
    return page;
  } catch {
    await context.close();
    throw new Error("Supported capability login did not complete; credentials redacted");
  }
}

const bearer = async (page: Page) => ({ Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("buildtwin_token"))}` });

test("should keep missing-model analytics unavailable and operational features restricted while visual work stays usable", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const outcomes: Array<{ identity: string; path: string; status: number; error?: string; capabilityState?: string }> = [];
  async function record(who: string, response: APIResponse, expected: number) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    outcomes.push({ identity: who, path: new URL(response.url()).pathname, status: response.status(), error: body.error as string, capabilityState: body.capabilityState as string });
    expect(response.status()).toBe(expected);
    return body;
  }
  try {
    const operator = await signIn(browser, fixture.operator, fixture.password);
    const capabilitiesResponse = await operator.request.get("/api/v1/capabilities");
    const capabilities = (await record("operator", capabilitiesResponse, 200)).capabilities as Array<{ name: string; state: string; userFriendlyReason: string }>;
    const stateOf = (name: string) => capabilities.find(item => item.name === name)!;
    for (const detector of detectors) expect(stateOf(detector.capability).state).toBe("UNAVAILABLE_MISSING_RESOURCES");
    expect(stateOf("TEMPORAL_VISUAL_COMPARISON").state).toBe("AVAILABLE");
    expect(stateOf("DRONE_MISSION_OPERATIONAL_EXPORT").state).toBe("RESTRICTED_PENDING_VALIDATION");
    expect(stateOf("DIGITAL_TWIN_INGESTION").state).toBe("RESTRICTED_PENDING_VALIDATION");
    const observationsBefore = await (await operator.request.get(`/api/v1/projects/${fixture.alpha.id}/built-area`)).json();

    await operator.goto(`/projects/${fixture.alpha.id}/progress`, { timeout: 120_000 });
    for (const detector of detectors) {
      const button = operator.getByRole("button", { name: detector.button, exact: true });
      await expect(button).toBeVisible({ timeout: 60_000 });
      await expect(button).toBeDisabled();
      const notice = operator.locator('[data-capability-notice="unavailable"]').filter({ hasText: stateOf(detector.capability).userFriendlyReason });
      await expect(notice).toBeVisible();
      await expect(notice).toContainText("Recurso indisponível");
    }
    const progressShot = info.outputPath("operator-progress-capability-unavailable.png");
    await operator.screenshot({ path: progressShot, fullPage: true });
    await info.attach("operator-progress-capability-unavailable", { path: progressShot, contentType: "image/png" });

    const operatorHeaders = await bearer(operator);
    for (const detector of detectors) {
      const cookieOnly = await record("operator-cookie-only", await operator.request.post(`/api/v1/capture-sessions/${fixture.sessionA}/${detector.route}`), 401);
      expect(cookieOnly).not.toHaveProperty("capabilityState");
      for (const [channel, request] of [
        ["bearer-proxy", () => operator.request.post(`/api/v1/capture-sessions/${fixture.sessionA}/${detector.route}`, { headers: operatorHeaders })],
        ["bearer", () => operator.request.post(`${environment.apiURL}/api/v1/capture-sessions/${fixture.sessionA}/${detector.route}`, { headers: operatorHeaders })],
      ] as const) {
        const body = await record(`operator-${channel}`, await request(), 400);
        expect(body).toMatchObject({ error: "CAPABILITY_UNAVAILABLE", capability: detector.capability, capabilityState: "UNAVAILABLE_MISSING_RESOURCES" });
        for (const field of numericOutputs) expect(body).not.toHaveProperty(field);
      }
    }

    const viewer = await signIn(browser, fixture.capabilityViewer, fixture.password);
    const viewerHeaders = await bearer(viewer);
    for (const detector of detectors) {
      const body = await record("viewer", await viewer.request.post(`/api/v1/capture-sessions/${fixture.sessionA}/${detector.route}`, { headers: viewerHeaders }), 403);
      expect(body.error).toBe("FORBIDDEN");
      expect(body).not.toHaveProperty("capabilityState");
    }

    const boundary = [{ lat: -23.55, lon: -46.63 }, { lat: -23.55, lon: -46.629 }, { lat: -23.549, lon: -46.629 }, { lat: -23.549, lon: -46.63 }];
    const saved = await record("operator", await operator.request.post("/api/v1/drone-mission", {
      headers: operatorHeaders,
      data: {
        projectId: fixture.alpha.id,
        name: "pilot-capability-diagnostic-mission",
        flightDate: null,
        boundary,
        waypoints: boundary.map(point => ({ ...point, altitudeMeters: 60, headingDeg: 0, triggerCamera: true, speedMps: 8 })),
        stats: { areaSquareMeters: 11000, altitudeMeters: 60, totalDistanceMeters: 400, estimatedTimeSeconds: 60, photoCount: 4, photosPerM2: 0.0004, gsdCmPerPixel: 1.6 },
        parameters: { overlapFront: 0.8, overlapSide: 0.7, flightSpeedMps: 8, marginMeters: 10 },
        camera: { model: "Diagnostic fixture camera", sensorWidthMm: 13.2, sensorHeightMm: 8.8, focalLengthMm: 8.8, imageWidthPx: 5472, imageHeightPx: 3648 },
      },
    }), 201);
    for (const [who, page] of [["operator", operator], ["viewer", viewer]] as const) {
      for (const format of ["kml", "json"]) {
        const body = await record(who, await page.request.get(`/api/v1/drone-mission/${saved.id}/export?format=${format}`), 403);
        expect(body.error).toBe("CAPABILITY_RESTRICTED");
        expect(JSON.stringify(body)).not.toContain("<kml");
      }
    }
    await operator.goto(`/projects/${fixture.alpha.id}/drone-mission`, { timeout: 120_000 });
    await operator.getByRole("button", { name: "Carregar missão no mapa" }).first().click();
    await expect(operator.getByText("NON-OPERATIONAL — NOT CERTIFIED FOR FLIGHT").first()).toBeVisible();
    await expect(operator.getByText("Exportação operacional (KML/JSON) restrita pendente validação").first()).toBeVisible();
    const droneShot = info.outputPath("operator-drone-mission-non-operational.png");
    await operator.screenshot({ path: droneShot, fullPage: true });
    await info.attach("operator-drone-mission-non-operational", { path: droneShot, contentType: "image/png" });

    for (const path of ["digital-twin", "digital-twin/graph", "digital-twin/spatial", "digital-twin/versions"]) {
      const body = await record("operator", await operator.request.get(`/api/v1/projects/${fixture.alpha.id}/${path}`), 404);
      expect(body).not.toHaveProperty("twin");
    }

    await viewer.goto(`/projects/${fixture.alpha.id}/compare?captureSessionA=${fixture.sessionA}&captureSessionB=${fixture.sessionB}`, { timeout: 120_000 });
    const heatmap = viewer.getByRole("img", { name: "Mapa de calor das mudanças detectadas" });
    await expect(heatmap).toBeVisible({ timeout: 120_000 });
    await expect.poll(() => heatmap.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const compareShot = info.outputPath("viewer-visual-comparison-allowed.png");
    await viewer.screenshot({ path: compareShot, fullPage: true });
    await info.attach("viewer-visual-comparison-allowed", { path: compareShot, contentType: "image/png" });

    expect(await (await operator.request.get(`/api/v1/projects/${fixture.alpha.id}/built-area`)).json()).toEqual(observationsBefore);
  } finally {
    await info.attach("capability-status-matrix", { body: Buffer.from(JSON.stringify(outcomes)), contentType: "application/json" });
    for (const context of browser.contexts()) await context.close();
  }
});
