import type { APIResponse, Browser, Page, TestInfo } from "@playwright/test";
import { z } from "zod";
import { test, expect } from "./fixtures";
import { resolveRealBrowserEnvironment } from "./environment";

const identity = z.object({ id: z.string().uuid(), email: z.string().regex(/^pilot-.*@example\.invalid$/) }).strict();
const project = z.object({ id: z.string().uuid(), name: z.string().startsWith("pilot-") }).strict();
const session = z.object({ id: z.string().uuid(), captureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict();
const manifest = z.object({
  kind: z.literal("buildtwin-disposable-evidence-semantics-v1"),
  operator: identity,
  viewer: identity,
  foreign: identity,
  project: project.extend({ plannedAreaSquareMeters: z.literal(1000) }).strict(),
  foreignProject: project,
  sessions: z.object({ baseline: session, latest: session, identical: session, fallback: session, comparable: session }).strict(),
}).strict();
type Identity = z.infer<typeof identity>;
type Fixture = z.infer<typeof manifest> & { password: string };

const lineage = z.object({
  observationId: z.string().uuid(),
  captureSessionId: z.string().uuid(),
  source: z.string(),
  revisionId: z.string().uuid().nullable(),
  revisionNumber: z.number().nullable(),
  recordedAt: z.string(),
  recordedBy: z.string().nullable(),
}).passthrough();
const progress = z.object({
  estimatedCompletionPercent: z.number().nullable(),
  currentBuiltAreaSquareMeters: z.number().nullable(),
  currentObservedAreaSquareMeters: z.number().nullable(),
  builtAreaDeltaFromFirstCaptureSquareMeters: z.number().nullable(),
  builtAreaDeltaFromPreviousCaptureSquareMeters: z.number().nullable(),
  builtAreaObservation: lineage.nullable(),
  builtAreaBaselineObservation: lineage.nullable(),
}).passthrough();
const visual = z.object({
  changePercentage: z.number().nullable(),
  averageDailyChange: z.number().nullable(),
  confidenceScore: z.number().nullable(),
  evidenceStatus: z.enum(["AVAILABLE", "INCONCLUSIVE", "UNAVAILABLE"]),
  unavailableReason: z.string().nullable(),
}).passthrough();
const compareItem = z.object({
  materialType: z.string(),
  quantityAtCaptureSessionA: z.number().nullable(),
  quantityAtCaptureSessionB: z.number().nullable(),
  inventoryDelta: z.number().nullable(),
}).passthrough();
const portfolio = z.object({
  overview: z.object({ totalProjects: z.number(), averageProgressPercent: z.number().nullable(), averageProgressPercentReason: z.string().nullable() }).passthrough(),
  benchmarks: z.object({ averageProgressPercent: z.number().nullable(), averageProgressPercentReason: z.string().nullable() }).passthrough(),
  distributions: z.object({ progress: z.array(z.object({ label: z.string(), count: z.number() })) }).passthrough(),
  projectsRequiringAttention: z.array(z.object({ projectId: z.string(), projectName: z.string(), estimatedCompletionPercent: z.number().nullable() }).passthrough()),
  insights: z.array(z.object({ title: z.string(), description: z.string() }).passthrough()),
  portfolioExplanation: z.unknown(),
  benchmarkSummary: z.unknown(),
}).passthrough();

const COMBINED_PROGRESS_CLAIM = [
  /(progresso|avan[cç]o|conclus[aã]o)\s+m[eé]di[oa][^.\n]{0,40}?\d+(?:[.,]\d+)?\s*%/i,
  /m[eé]dia\s+(de\s+)?(progresso|avan[cç]o|conclus[aã]o)[^.\n]{0,40}?\d+(?:[.,]\d+)?\s*%/i,
  /average\s+(progress|completion)[^.\n]{0,40}?\d+(?:[.,]\d+)?\s*%/i,
];
const PENDING_AGGREGATION = "AGGREGATION_POLICY_PENDING_APPROVAL";

const environment = resolveRealBrowserEnvironment(process.env);
const outcomes: Array<Record<string, unknown>> = [];
const recorded: Record<string, unknown> = {};
test.describe.configure({ mode: "serial" });
test.setTimeout(240_000);

function resolveFixture(): Fixture {
  const raw = process.env.BUILDTWIN_REAL_EVIDENCE_FIXTURES;
  const password = process.env.BUILDTWIN_REAL_USER_PASSWORD;
  if (!raw || !password) throw new Error("Disposable evidence semantics fixtures are required");
  return { ...manifest.parse(JSON.parse(raw)), password };
}

async function signIn(browser: Browser, user: Identity, password: string): Promise<Page> {
  const context = await browser.newContext({ baseURL: environment.baseURL });
  const page = await context.newPage();
  try {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(user.email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    const response = page.waitForResponse((value) => value.url().endsWith("/api/v1/auth/login") && value.request().method() === "POST");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    expect((await response).status()).toBe(200);
    await page.waitForURL(/\/(admin|dashboard)(?:[/?#]|$)/);
    return page;
  } catch {
    await context.close();
    throw new Error("Supported evidence semantics login did not complete; credentials redacted");
  }
}

async function call(page: Page, actor: string, method: "GET" | "POST", path: string, data?: unknown): Promise<APIResponse> {
  const token = await page.evaluate(() => localStorage.getItem("buildtwin_token"));
  if (!token) throw new Error("Missing supported session");
  const response = await page.request.fetch(`${environment.apiURL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    maxRedirects: 0,
    ...(data === undefined ? {} : { data }),
  });
  outcomes.push({ actor, method, path, status: response.status() });
  return response;
}

async function readJson<T>(page: Page, actor: string, path: string, schema: z.ZodType<T>): Promise<T> {
  const response = await call(page, actor, "GET", path);
  expect(response.status(), `${actor} GET ${path}`).toBe(200);
  return schema.parse(await response.json());
}

async function screenshot(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await info.attach(name, { path, contentType: "image/png" });
}

async function openProgress(page: Page, fixture: Fixture) {
  await page.goto(`/projects/${fixture.project.id}/progress`);
  await expect(page.getByRole("heading", { name: "Progresso da Obra", exact: true }).first()).toBeVisible();
  await expect(page.getByText("Área Construída", { exact: true }).first()).toBeVisible();
}

async function registerBuiltAreaThroughDialog(page: Page, sessionId: string, area: string, notes: string): Promise<APIResponse> {
  await page.getByRole("button", { name: "Registrar Área Construída", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Registrar Área Construída" })).toBeVisible();
  await dialog.locator("#built-area-flight").selectOption(sessionId);
  await dialog.locator("#built-area-input").fill(area);
  await dialog.locator("#built-area-notes").fill(notes);
  const response = page.waitForResponse((value) => new URL(value.url()).pathname === `/api/v1/capture-sessions/${sessionId}/built-area` && value.request().method() === "POST");
  await dialog.getByRole("button", { name: "Registrar", exact: true }).click();
  return await response;
}

async function readProgress(page: Page, actor: string, fixture: Fixture) {
  return await readJson(page, actor, `/api/v1/projects/${fixture.project.id}/progress`, progress);
}

function expectSameApprovedScope(value: z.infer<typeof progress>, latestId: string, baselineId: string, fixture: Fixture) {
  expect(value.estimatedCompletionPercent).toBeCloseTo(25, 5);
  expect(value.currentBuiltAreaSquareMeters).toBeCloseTo(250, 5);
  expect(value.builtAreaDeltaFromFirstCaptureSquareMeters).toBeCloseTo(150, 5);
  expect(value.builtAreaDeltaFromPreviousCaptureSquareMeters).toBeCloseTo(150, 5);
  expect(value.currentObservedAreaSquareMeters).toBeNull();
  expect(value.builtAreaObservation).toMatchObject({ observationId: latestId, captureSessionId: fixture.sessions.latest.id, source: "MANUAL", revisionNumber: 2 });
  expect(value.builtAreaBaselineObservation).toMatchObject({ observationId: baselineId, captureSessionId: fixture.sessions.baseline.id, source: "MANUAL", revisionNumber: 1 });
}

function expectNoCombinedProgressClaim(text: string) {
  for (const pattern of COMBINED_PROGRESS_CLAIM) expect(text).not.toMatch(pattern);
}

test.afterAll(async ({}, info) => {
  await info.attach("evidence-outcomes.json", { body: JSON.stringify({ outcomes, recorded }, null, 2), contentType: "application/json" });
});

test("should retain every manual built area revision and resolve 25 percent when the operator registers 100 then 200 then 250 against target 1000", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const sut = await signIn(browser, fixture.operator, fixture.password);
  try {
    await openProgress(sut, fixture);
    await sut.getByRole("button", { name: "Registrar Área Construída", exact: true }).click();
    const dialog = sut.getByRole("dialog");
    await dialog.locator("#built-area-flight").selectOption(fixture.sessions.latest.id);
    await dialog.locator("#built-area-input").fill("-5");
    const unexpected: string[] = [];
    sut.on("request", (request) => {
      if (request.method() === "POST" && request.url().includes("/built-area")) unexpected.push(request.url());
    });
    await dialog.getByRole("button", { name: "Registrar", exact: true }).click();
    await expect(dialog.getByText("Informe uma área maior que zero.")).toBeVisible();
    expect(unexpected).toEqual([]);
    sut.removeAllListeners("request");
    await sut.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    const baseline = await registerBuiltAreaThroughDialog(sut, fixture.sessions.baseline.id, "100", "pilot-t072 baseline 100");
    expect(baseline.status()).toBe(201);
    const baselineBody = await baseline.json() as { id: string; observedBuiltAreaSquareMeters: number };
    expect(baselineBody.observedBuiltAreaSquareMeters).toBe(100);
    await expect(sut.getByRole("dialog")).toHaveCount(0);

    const first = await registerBuiltAreaThroughDialog(sut, fixture.sessions.latest.id, "200", "pilot-t072 latest 200");
    expect(first.status()).toBe(201);
    const firstBody = await first.json() as { id: string; observedBuiltAreaSquareMeters: number };
    expect(firstBody.observedBuiltAreaSquareMeters).toBe(200);
    await expect(sut.getByRole("dialog")).toHaveCount(0);

    const revised = await registerBuiltAreaThroughDialog(sut, fixture.sessions.latest.id, "250", "pilot-t072 latest revised 250");
    expect(revised.status()).toBe(201);
    const revisedBody = await revised.json() as { id: string; observedBuiltAreaSquareMeters: number };
    expect(revisedBody.observedBuiltAreaSquareMeters).toBe(250);
    expect(revisedBody.id).toBe(firstBody.id);
    await expect(sut.getByRole("dialog")).toHaveCount(0);

    const invalid = await call(sut, "operator", "POST", `/api/v1/capture-sessions/${fixture.sessions.latest.id}/built-area`, { observedBuiltAreaSquareMeters: -1 });
    expect(invalid.status()).toBe(400);
    const missing = await call(sut, "operator", "POST", `/api/v1/capture-sessions/${fixture.sessions.latest.id}/built-area`, {});
    expect(missing.status()).toBe(400);

    const project = await readProgress(sut, "operator", fixture);
    expectSameApprovedScope(project, firstBody.id, baselineBody.id, fixture);
    expect(project.builtAreaObservation?.recordedBy ?? "").not.toBe("");
    const snapshots = await readJson(sut, "operator", `/api/v1/projects/${fixture.project.id}/built-area`, z.object({ snapshots: z.array(z.object({ captureSessionId: z.string(), observedBuiltAreaSquareMeters: z.number(), source: z.string() }).passthrough()) }).passthrough());
    expect(snapshots.snapshots.map((item) => [item.captureSessionId, item.observedBuiltAreaSquareMeters, item.source]).sort()).toEqual([
      [fixture.sessions.baseline.id, 100, "MANUAL"],
      [fixture.sessions.latest.id, 250, "MANUAL"],
    ].sort());
    const history = await readJson(sut, "operator", `/api/v1/projects/${fixture.project.id}/progress/history`, z.object({ history: z.array(z.unknown()) }).passthrough());
    expect(history.history).toEqual([]);

    await sut.reload();
    await expect(sut.getByText("250 m²").first()).toBeVisible();
    await expect(sut.getByText("+25,0%").first()).toBeVisible();
    const lineageText = sut.getByText(/^Manual · levantamento de .* · revisão 2 · registrado em /);
    await expect(lineageText).toBeVisible();
    await expect(sut.getByText(/^Manual · levantamento de .* · revisão 1 · registrado em /)).toBeVisible();
    const pageText = await sut.locator("main").innerText();
    expect(pageText).not.toMatch(/confian[cç]a[^\n]{0,30}100\s*%/i);
    await screenshot(sut, info, "operator-progress-after-revisions");

    const scoped = await readJson(sut, "operator", "/api/v1/portfolio/intelligence", portfolio);
    expect(scoped.overview.totalProjects).toBe(1);
    expect(scoped.overview.averageProgressPercent).toBeNull();
    expect(scoped.overview.averageProgressPercentReason).toBe(PENDING_AGGREGATION);
    expect(scoped.benchmarks.averageProgressPercent).toBeNull();
    expect(scoped.benchmarks.averageProgressPercentReason).toBe(PENDING_AGGREGATION);
    expect(scoped.distributions.progress.find((bucket) => bucket.label === "25-50%")?.count).toBe(1);
    for (const entry of scoped.projectsRequiringAttention.filter((item) => item.projectId === fixture.project.id)) {
      expect(entry.estimatedCompletionPercent).toBeCloseTo(25, 5);
    }
    expect(scoped.projectsRequiringAttention.every((item) => item.projectId === fixture.project.id)).toBe(true);
    expectNoCombinedProgressClaim(JSON.stringify([scoped.insights, scoped.portfolioExplanation, scoped.benchmarkSummary]));

    await sut.goto("/portfolio");
    const card = sut.locator('[data-slot="card"]', { hasText: "Progresso médio" }).last();
    await expect(card).toBeVisible();
    await expect(card).toContainText("—");
    await expect(card).toContainText("Agregação pendente de aprovação");
    await expect(card).not.toContainText("%");
    expectNoCombinedProgressClaim(await sut.locator("main").innerText());
    await screenshot(sut, info, "operator-portfolio-without-combined-progress");

    recorded.builtArea = { baselineId: baselineBody.id, latestId: firstBody.id, project, portfolio: { overview: scoped.overview, benchmarks: scoped.benchmarks, progress: scoped.distributions.progress, projectsRequiringAttention: scoped.projectsRequiringAttention.map((item) => ({ projectId: item.projectId, estimatedCompletionPercent: item.estimatedCompletionPercent })) } };
  } finally {
    await sut.context().close();
  }
});

test("should keep unknown inventory distinct from observed zero when the operator registers and compares stock", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const sut = await signIn(browser, fixture.operator, fixture.password);
  try {
    await openProgress(sut, fixture);
    await sut.getByRole("button", { name: "Registrar Inventário", exact: true }).click();
    let dialog = sut.getByRole("dialog");
    await dialog.locator("#inventory-flight").selectOption(fixture.sessions.baseline.id);
    await dialog.locator('select[id^="material-"]').nth(0).selectOption("BRICK");
    await dialog.locator('input[id^="quantity-"]').nth(0).fill("-3");
    await dialog.getByRole("button", { name: "Registrar", exact: true }).click();
    await expect(dialog.locator('input[id^="quantity-"]').nth(0)).toBeVisible();
    await expect(dialog.getByText(/maior ou igual a zero|não negativ|inválid/i).first()).toBeVisible();
    await dialog.locator('input[id^="quantity-"]').nth(0).fill("0");
    await dialog.locator('select[id^="unit-"]').nth(0).selectOption("UNIT");
    await dialog.getByRole("button", { name: "Adicionar material", exact: true }).click();
    await dialog.locator('select[id^="material-"]').nth(1).selectOption("CEMENT");
    await dialog.locator('input[id^="quantity-"]').nth(1).fill("50");
    await dialog.locator('select[id^="unit-"]').nth(1).selectOption("BAG");
    let response = sut.waitForResponse((value) => new URL(value.url()).pathname === `/api/v1/capture-sessions/${fixture.sessions.baseline.id}/inventory` && value.request().method() === "POST");
    await dialog.getByRole("button", { name: "Registrar", exact: true }).click();
    expect((await response).status()).toBe(201);
    await expect(sut.getByRole("dialog")).toHaveCount(0);

    await sut.getByRole("button", { name: "Registrar Inventário", exact: true }).click();
    dialog = sut.getByRole("dialog");
    await dialog.locator("#inventory-flight").selectOption(fixture.sessions.latest.id);
    await dialog.locator('select[id^="material-"]').nth(0).selectOption("BRICK");
    await dialog.locator('input[id^="quantity-"]').nth(0).fill("120");
    await dialog.locator('select[id^="unit-"]').nth(0).selectOption("UNIT");
    response = sut.waitForResponse((value) => new URL(value.url()).pathname === `/api/v1/capture-sessions/${fixture.sessions.latest.id}/inventory` && value.request().method() === "POST");
    await dialog.getByRole("button", { name: "Registrar", exact: true }).click();
    expect((await response).status()).toBe(201);
    await expect(sut.getByRole("dialog")).toHaveCount(0);

    for (const quantity of [-1, "1e999"]) {
      const rejected = await call(sut, "operator", "POST", `/api/v1/capture-sessions/${fixture.sessions.latest.id}/inventory`, { items: [{ materialType: "SAND", quantity, unit: "CUBIC_METER" }] });
      expect(rejected.status(), `quantity ${quantity}`).toBe(400);
    }

    const inventory = await readJson(sut, "operator", `/api/v1/projects/${fixture.project.id}/inventory`, z.object({ snapshots: z.array(z.object({ captureSessionId: z.string(), materialType: z.string(), quantity: z.number().nullable(), unit: z.string(), source: z.string() }).passthrough()) }).passthrough());
    const observed = inventory.snapshots.map((item) => [item.captureSessionId, item.materialType, item.quantity, item.unit, item.source]).sort();
    expect(observed).toEqual([
      [fixture.sessions.baseline.id, "BRICK", 0, "UNIT", "MANUAL"],
      [fixture.sessions.baseline.id, "CEMENT", 50, "BAG", "MANUAL"],
      [fixture.sessions.latest.id, "BRICK", 120, "UNIT", "MANUAL"],
    ].sort());

    const query = `captureSessionA=${fixture.sessions.baseline.id}&captureSessionB=${fixture.sessions.latest.id}`;
    const compare = await readJson(sut, "operator", `/api/v1/projects/${fixture.project.id}/inventory/compare?${query}`, z.object({ materials: z.array(compareItem) }).passthrough());
    const brick = compare.materials.find((item) => item.materialType === "BRICK");
    const cement = compare.materials.find((item) => item.materialType === "CEMENT");
    expect(brick).toMatchObject({ quantityAtCaptureSessionA: 0, quantityAtCaptureSessionB: 120, inventoryDelta: -120 });
    expect(cement).toMatchObject({ quantityAtCaptureSessionA: 50, quantityAtCaptureSessionB: null, inventoryDelta: null });
    const consumption = await call(sut, "operator", "GET", `/api/v1/projects/${fixture.project.id}/inventory/consumption?${query}`);
    expect(consumption.status()).toBe(200);
    const consumptionBody = await consumption.json() as { materials?: Array<{ materialType: string; quantityConsumed: number | null; unavailableReason?: string | null }>; totalConsumedMaterials?: number | null };
    expect((consumptionBody.materials ?? []).every((item) => item.quantityConsumed === null)).toBe(true);
    expect(consumptionBody.totalConsumedMaterials ?? null).toBeNull();

    await sut.reload();
    const historyTable = sut.locator('[data-slot="card"]', { hasText: "Histórico de Inventário" }).locator("table");
    await expect(historyTable.getByRole("row", { name: /Tijolo Quantidade 0 un/ })).toBeVisible();
    await expect(historyTable.getByRole("row", { name: /Cimento Quantidade 50/ })).toBeVisible();
    const panel = sut.locator('[data-slot="card"]', { hasText: "Comparar Inventário" }).first();
    await panel.locator("#inventory-flight-a").selectOption(fixture.sessions.baseline.id);
    await panel.locator("#inventory-flight-b").selectOption(fixture.sessions.latest.id);
    await panel.getByRole("button", { name: "Comparar", exact: true }).click();
    const cementRow = panel.locator("tbody tr", { hasText: "Cimento" });
    await expect(cementRow).toContainText("Não informado");
    await expect(cementRow).toContainText("Não disponível");
    const brickRow = panel.locator("tbody tr", { hasText: "Tijolo" });
    await expect(brickRow).toContainText(/(?<!\d)0 un/);
    await expect(brickRow).toContainText(/120 un/);
    await expect(brickRow).not.toContainText("Não informado");
    await expect(sut.locator('[data-slot="card"]', { hasText: "Variação de Estoque" }).last()).toContainText("Não disponível");
    await screenshot(sut, info, "operator-inventory-unknown-versus-observed-zero");
    recorded.inventory = { observed, compare: compare.materials, consumption: consumptionBody };
  } finally {
    await sut.context().close();
  }
});

test("should let the viewer read the same approved scope and refuse every viewer write without changing persisted evidence", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const operator = await signIn(browser, fixture.operator, fixture.password);
  const before = await readProgress(operator, "operator", fixture);
  const inventoryBefore = await (await call(operator, "operator", "GET", `/api/v1/projects/${fixture.project.id}/inventory`)).json();
  await operator.context().close();
  const sut = await signIn(browser, fixture.viewer, fixture.password);
  try {
    const read = await readProgress(sut, "viewer", fixture);
    expect(read).toEqual(before);
    await openProgress(sut, fixture);
    await expect(sut.getByText("250 m²").first()).toBeVisible();
    await expect(sut.getByText(/^Manual · levantamento de .* · revisão 2 · registrado em /)).toBeVisible();

    const denied = await registerBuiltAreaThroughDialog(sut, fixture.sessions.latest.id, "999", "pilot-t072 forbidden viewer write");
    expect(denied.status()).toBe(403);
    await expect(sut.getByRole("dialog")).toBeVisible();
    await expect(sut.getByRole("dialog").locator("p.text-destructive")).toBeVisible();
    await screenshot(sut, info, "viewer-built-area-write-denied");
    await sut.keyboard.press("Escape");

    expect((await call(sut, "viewer", "POST", `/api/v1/capture-sessions/${fixture.sessions.latest.id}/built-area`, { observedBuiltAreaSquareMeters: 999 })).status()).toBe(403);
    expect((await call(sut, "viewer", "POST", `/api/v1/capture-sessions/${fixture.sessions.latest.id}/inventory`, { items: [{ materialType: "BRICK", quantity: 0, unit: "UNIT" }] })).status()).toBe(403);
    expect((await call(sut, "viewer", "POST", `/api/v1/capture-sessions/${fixture.sessions.latest.id}/built-area/detect`)).status()).toBe(403);

    expect(await readProgress(sut, "viewer", fixture)).toEqual(before);
    expect(await (await call(sut, "viewer", "GET", `/api/v1/projects/${fixture.project.id}/inventory`)).json()).toEqual(inventoryBefore);
    const viewerPortfolio = await call(sut, "viewer", "GET", "/api/v1/portfolio/intelligence");
    recorded.viewerPortfolioStatus = viewerPortfolio.status();
    if (viewerPortfolio.status() === 200) {
      const body = portfolio.parse(await viewerPortfolio.json());
      expect(body.overview.averageProgressPercent).toBeNull();
      expect(body.benchmarks.averageProgressPercent).toBeNull();
      expectNoCombinedProgressClaim(JSON.stringify([body.insights, body.portfolioExplanation, body.benchmarkSummary]));
    } else {
      expect(viewerPortfolio.status()).toBe(403);
    }
    await sut.reload();
    await expect(sut.getByText("250 m²").first()).toBeVisible();
    await screenshot(sut, info, "viewer-progress-after-denials");
    recorded.viewer = { read };
  } finally {
    await sut.context().close();
  }
});

test("should hide the project evidence from a foreign organization and keep it unchanged after foreign writes", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const operator = await signIn(browser, fixture.operator, fixture.password);
  const before = await readProgress(operator, "operator", fixture);
  expect((await call(operator, "operator", "GET", `/api/v1/projects/${fixture.foreignProject.id}/progress`)).status()).toBe(404);
  await operator.context().close();
  const sut = await signIn(browser, fixture.foreign, fixture.password);
  try {
    const query = `captureSessionA=${fixture.sessions.baseline.id}&captureSessionB=${fixture.sessions.latest.id}`;
    for (const path of [
      `/api/v1/projects/${fixture.project.id}`,
      `/api/v1/projects/${fixture.project.id}/progress`,
      `/api/v1/projects/${fixture.project.id}/progress?${query}`,
      `/api/v1/projects/${fixture.project.id}/built-area`,
      `/api/v1/projects/${fixture.project.id}/inventory`,
      `/api/v1/projects/${fixture.project.id}/inventory/compare?${query}`,
    ]) {
      expect((await call(sut, "foreign", "GET", path)).status(), path).toBe(404);
    }
    expect((await call(sut, "foreign", "POST", `/api/v1/capture-sessions/${fixture.sessions.latest.id}/built-area`, { observedBuiltAreaSquareMeters: 999 })).status()).toBe(404);
    expect((await call(sut, "foreign", "POST", `/api/v1/capture-sessions/${fixture.sessions.latest.id}/inventory`, { items: [{ materialType: "BRICK", quantity: 1, unit: "UNIT" }] })).status()).toBe(404);
    const own = await readJson(sut, "foreign", "/api/v1/portfolio/intelligence", portfolio);
    expect(own.overview.totalProjects).toBe(1);
    expect(own.overview.averageProgressPercent).toBeNull();
    expect(JSON.stringify(own)).not.toContain(fixture.project.id);
    expect(JSON.stringify(own)).not.toContain(fixture.project.name);
    expect(own.distributions.progress.find((bucket) => bucket.label === "25-50%")?.count ?? 0).toBe(0);
    await sut.goto("/projects");
    await expect(sut.getByText(fixture.foreignProject.name, { exact: true }).first()).toBeVisible();
    await expect(sut.getByText(fixture.project.name, { exact: true })).toHaveCount(0);
    await screenshot(sut, info, "foreign-projects-without-alpha");
  } finally {
    await sut.context().close();
  }
  const after = await signIn(browser, fixture.operator, fixture.password);
  try {
    expect(await readProgress(after, "operator", fixture)).toEqual(before);
  } finally {
    await after.context().close();
  }
});

test("should label visual change by evidence status and never turn it into built area when photos are comparable, mismatched, identical or fallback", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const sut = await signIn(browser, fixture.operator, fixture.password);
  const pairs = {
    comparable: [fixture.sessions.latest.id, fixture.sessions.comparable.id],
    real: [fixture.sessions.baseline.id, fixture.sessions.latest.id],
    identical: [fixture.sessions.latest.id, fixture.sessions.identical.id],
    fallback: [fixture.sessions.baseline.id, fixture.sessions.fallback.id],
  } as const;
  const visuals: Record<string, unknown> = {};
  try {
    const approved = await readProgress(sut, "operator", fixture);
    for (const [name, [a, b]] of Object.entries(pairs)) {
      const value = await readJson(sut, "operator", `/api/v1/projects/${fixture.project.id}/progress?captureSessionA=${a}&captureSessionB=${b}`, visual);
      visuals[name] = value;
      if (name === "comparable") {
        expect(value.evidenceStatus).toBe("AVAILABLE");
        expect(value.changePercentage).not.toBeNull();
      }
      if (name === "identical") {
        expect(value.evidenceStatus).toBe("INCONCLUSIVE");
      }
      if (name === "fallback") {
        expect(value.evidenceStatus).not.toBe("AVAILABLE");
        expect(value.confidenceScore).toBeNull();
      }
      if (value.evidenceStatus === "UNAVAILABLE") {
        expect(value.changePercentage).toBeNull();
        expect(value.averageDailyChange).toBeNull();
        expect(value.confidenceScore).toBeNull();
        expect(value.unavailableReason).not.toBeNull();
      }
      if (value.evidenceStatus !== "AVAILABLE") {
        expect(value.unavailableReason).not.toBeNull();
      }

      await sut.goto(`/projects/${fixture.project.id}/compare?captureSessionA=${a}&captureSessionB=${b}`);
      const card = sut.locator('[data-slot="card"]', { hasText: "Indicador de Progresso" }).first();
      await expect(card).toBeVisible({ timeout: 60_000 });
      await expect(card).toContainText("Não representa progresso físico");
      await expect(card).not.toContainText(/confian[cç]a/i);
      const metric = card.locator('[data-slot="card"]', { hasText: "Mudança visual observada" }).first();
      if (value.evidenceStatus === "AVAILABLE") {
        await expect(metric).toContainText(/\d+,\d%/);
        await expect(card.getByRole("status")).toHaveCount(0);
      } else {
        await expect(metric).toContainText(value.evidenceStatus === "INCONCLUSIVE" ? "Inconclusivo" : "Não disponível");
        await expect(card.getByRole("status")).toBeVisible();
      }
      await screenshot(sut, info, `visual-${name}`);
    }
    const afterVisual = await readProgress(sut, "operator", fixture);
    expect(afterVisual).toEqual(approved);
    expect(afterVisual.currentObservedAreaSquareMeters).toBeNull();
    const history = await readJson(sut, "operator", `/api/v1/projects/${fixture.project.id}/progress/history`, z.object({ history: z.array(z.unknown()) }).passthrough());
    expect(history.history).toEqual([]);
    recorded.visual = visuals;
  } finally {
    await sut.context().close();
  }
});
