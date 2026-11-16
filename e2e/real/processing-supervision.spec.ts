import type { Browser, Page, TestInfo } from "@playwright/test";
import { z } from "zod";
import { test, expect } from "./fixtures";
import { resolveRealBrowserEnvironment } from "./environment";

const identity = z.object({
  id: z.string().uuid(),
  email: z.string().regex(/^pilot-.*@example\.invalid$/),
});
const manifest = z.object({
  kind: z.literal("buildtwin-disposable-processing-supervision-v1"),
  scenario: z.string().min(1),
  operator: identity,
  viewer: identity,
  projectId: z.string().uuid(),
  captureSessionId: z.string().uuid(),
  jobId: z.string().uuid(),
});
type Identity = z.infer<typeof identity>;
type Fixture = z.infer<typeof manifest> & { password: string };

const jobView = z.object({
  jobId: z.string().uuid(),
  status: z.string(),
  recoverable: z.boolean().nullable().optional(),
  recoveryCause: z.string().nullable().optional(),
  failureReason: z.string().nullable().optional(),
});
type JobView = z.infer<typeof jobView>;

const CAUSE_LABELS: Record<string, string> = {
  PROGRESS_UNVERIFIED: "Progresso não verificado",
  CONTACT_LOST: "Contato perdido com o processador",
  SUPERVISION_EXPIRED: "Supervisão expirada",
  EXECUTION_DEADLINE_EXCEEDED: "Prazo de execução excedido",
};
const ENGINE_STAGE_SCENARIOS = new Set(["stall", "contact-loss", "hung-engine", "standard"]);
const ENGINE_VISIBILITY_LIMIT_MS = 3_670_000;
const OTHER_VISIBILITY_LIMIT_MS = 900_000;
const OBSERVATION_LIMIT_MS = 4_200_000;

function visibilityLimitMs(scenario: string): number {
  return ENGINE_STAGE_SCENARIOS.has(scenario) ? ENGINE_VISIBILITY_LIMIT_MS : OTHER_VISIBILITY_LIMIT_MS;
}
const environment = resolveRealBrowserEnvironment(process.env);
test.setTimeout(OBSERVATION_LIMIT_MS + 120_000);

function resolveFixture(): Fixture {
  const raw = process.env.BUILDTWIN_REAL_SUPERVISION_FIXTURES;
  const password = process.env.BUILDTWIN_REAL_USER_PASSWORD;
  if (!raw || !password) throw new Error("Disposable processing supervision fixtures are required");
  return { ...manifest.parse(JSON.parse(raw)), password };
}

async function signIn(browser: Browser, user: Identity, password: string): Promise<Page> {
  const context = await browser.newContext({ baseURL: environment.baseURL });
  const page = await context.newPage();
  try {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(user.email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    const response = page.waitForResponse(
      (value) => value.url().endsWith("/api/v1/auth/login") && value.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    expect((await response).status()).toBe(200);
    await page.waitForURL(/\/(admin|dashboard)(?:[/?#]|$)/);
    return page;
  } catch {
    await context.close();
    throw new Error("Supported processing supervision login did not complete; credentials redacted");
  }
}

async function readJob(page: Page, jobId: string): Promise<JobView> {
  const token = await page.evaluate(() => localStorage.getItem("buildtwin_token"));
  const response = await page.request.get(`${environment.apiURL}/api/v1/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.status()).toBe(200);
  return jobView.parse(await response.json());
}

async function openSession(page: Page, fixture: Fixture) {
  await page.goto(`/projects/${fixture.projectId}/capture-sessions/${fixture.captureSessionId}`);
  await expect(page.getByText("Monitoramento", { exact: true })).toBeVisible();
}

async function capture(page: Page, info: TestInfo, name: string) {
  await page.locator("#job-status-panel").screenshot({ path: info.outputPath(`${name}.png`) });
}

test("should show a safe recoverable cause in the browser within the visibility limit when execution ceases @cessation", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const started = Date.now();
  const operator = await signIn(browser, fixture.operator, fixture.password);
  const timeline: Record<string, unknown> = { scenario: fixture.scenario, jobId: fixture.jobId, startedAt: new Date(started).toISOString() };
  try {
    let ceased: JobView | null = null;
    await expect.poll(async () => {
      const job = await readJob(operator, fixture.jobId);
      if (job.status === "FAILED" && job.recoverable === true && job.recoveryCause && CAUSE_LABELS[job.recoveryCause]) {
        ceased = job;
        return "visible";
      }
      return job.status;
    }, { timeout: OBSERVATION_LIMIT_MS, intervals: [2_000] }).toBe("visible");
    const apiVisibleAt = Date.now();
    if (!ceased) throw new Error("Recoverable supervision outcome was not observed");
    const observed: JobView = ceased;
    timeline.apiVisibleAt = new Date(apiVisibleAt).toISOString();
    timeline.apiElapsedMs = apiVisibleAt - started;
    timeline.cause = observed.recoveryCause;
    timeline.failureReason = observed.failureReason ?? null;
    const limitMs = visibilityLimitMs(fixture.scenario);
    timeline.visibilityLimitMs = limitMs;
    expect(timeline.apiElapsedMs).toBeLessThanOrEqual(limitMs);

    await openSession(operator, fixture);
    const label = CAUSE_LABELS[observed.recoveryCause ?? ""];
    await expect(operator.getByTestId("job-recovery-panel")).toContainText(label);
    const browserVisibleAt = Date.now();
    timeline.browserVisibleAt = new Date(browserVisibleAt).toISOString();
    timeline.browserElapsedMs = browserVisibleAt - started;
    expect(timeline.browserElapsedMs).toBeLessThanOrEqual(limitMs);
    await capture(operator, info, "cessation-operator");
  } finally {
    await operator.context().close();
  }

  const viewer = await signIn(browser, fixture.viewer, fixture.password);
  try {
    const before = await readJob(viewer, fixture.jobId);
    await openSession(viewer, fixture);
    const label = CAUSE_LABELS[before.recoveryCause ?? ""];
    await expect(viewer.getByTestId("job-recovery-panel")).toContainText(label);
    const denied = viewer.waitForResponse(
      (value) => value.url().endsWith(`/api/v1/jobs/${fixture.jobId}/recover`) && value.request().method() === "POST",
    );
    await viewer.getByRole("button", { name: "Recuperar processamento" }).click();
    timeline.viewerRecoverStatus = (await denied).status();
    expect(timeline.viewerRecoverStatus).toBe(403);
    const afterDenial = await readJob(viewer, fixture.jobId);
    expect(afterDenial).toEqual(before);
    await capture(viewer, info, "cessation-viewer-denied");
  } finally {
    await info.attach("supervision-timeline.json", {
      body: JSON.stringify(timeline, null, 2),
      contentType: "application/json",
    });
    await viewer.context().close();
  }
});
