import type { Browser, Page, TestInfo } from "@playwright/test";
import { z } from "zod";
import { test, expect } from "./fixtures";
import { resolveRealBrowserEnvironment } from "./environment";

const identity = z.object({ id: z.string().uuid(), email: z.string().regex(/^pilot-.*@example\.invalid$/) });
const manifest = z.object({
  kind: z.literal("buildtwin-disposable-processing-recovery-v1"),
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
  attempt: z.object({ attemptNumber: z.number(), state: z.string() }).nullable().optional(),
  stages: z.array(z.object({ stage: z.string(), status: z.string(), processingProfile: z.string().nullable() })).optional(),
  stageEvidence: z.string().optional(),
  artifacts: z.array(z.object({ artifactId: z.string().uuid(), artifactType: z.string(), checksum: z.string() })).optional(),
});
type JobView = z.infer<typeof jobView>;

const CAUSE_LABELS: Record<string, string> = {
  PROGRESS_UNVERIFIED: "Progresso não verificado",
  CONTACT_LOST: "Contato perdido com o processador",
  SUPERVISION_EXPIRED: "Supervisão expirada",
  EXECUTION_DEADLINE_EXCEEDED: "Prazo de execução excedido",
};
const environment = resolveRealBrowserEnvironment(process.env);
test.setTimeout(900_000);

function resolveFixture(): Fixture {
  const raw = process.env.BUILDTWIN_REAL_RECOVERY_FIXTURES;
  const password = process.env.BUILDTWIN_REAL_USER_PASSWORD;
  if (!raw || !password) throw new Error("Disposable processing recovery fixtures are required");
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
    throw new Error("Supported processing recovery login did not complete; credentials redacted");
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

function summarize(job: JobView) {
  return {
    jobId: job.jobId,
    status: job.status,
    recoverable: job.recoverable ?? null,
    recoveryCause: job.recoveryCause ?? null,
    attempt: job.attempt ?? null,
    stageEvidence: job.stageEvidence ?? null,
    stages: job.stages?.map(stage => `${stage.stage}:${stage.status}:${stage.processingProfile ?? "-"}`) ?? [],
    artifacts: job.artifacts?.map(artifact => `${artifact.artifactType}:${artifact.artifactId}:${artifact.checksum}`) ?? [],
  };
}

test("should show progressing work without a recovery action when the job is running @progressing", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const operator = await signIn(browser, fixture.operator, fixture.password);
  try {
    const job = await readJob(operator, fixture.jobId);
    expect(job.status).toBe("RUNNING");
    expect(job.recoverable ?? null).toBeNull();

    await openSession(operator, fixture);

    await expect(operator.getByText("Gerando ortomosaico")).toBeVisible();
    await expect(operator.getByRole("button", { name: "Recuperar processamento" })).toHaveCount(0);
    await expect(operator.getByRole("list", { name: "Etapas do processamento" })).toHaveCount(0);
    await expect(operator.getByText("Atualizando a cada 5 segundos...")).toBeVisible();
    await capture(operator, info, "progressing-operator");
    await info.attach("progressing-job.json", { body: JSON.stringify(summarize(job), null, 2), contentType: "application/json" });
  } finally {
    await operator.context().close();
  }
});

test("should deny the viewer and recover the same job once for the operator when progress became uncertain @recoverable", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const outcomes: Record<string, unknown> = {};

  const viewer = await signIn(browser, fixture.viewer, fixture.password);
  try {
    const before = await readJob(viewer, fixture.jobId);
    outcomes.before = summarize(before);
    expect(before.status).toBe("FAILED");
    expect(before.recoverable).toBe(true);

    await openSession(viewer, fixture);
    await expect(viewer.locator('#job-status-panel [data-slot="badge"]')).toHaveText("Falha no processamento");
    const causeLabel = before.recoveryCause ? CAUSE_LABELS[before.recoveryCause] : "Falha recuperável";
    await expect(viewer.getByTestId("job-recovery-panel")).toContainText(causeLabel ?? "unmapped cause");
    await capture(viewer, info, "recoverable-viewer");

    const denied = viewer.waitForResponse(value => value.url().endsWith(`/api/v1/jobs/${fixture.jobId}/recover`) && value.request().method() === "POST");
    await viewer.getByRole("button", { name: "Recuperar processamento" }).click();
    outcomes.viewerRecoverStatus = (await denied).status();
    expect(outcomes.viewerRecoverStatus).toBe(403);
    await expect(viewer.getByTestId("job-recovery-panel").getByRole("alert")).toHaveText("Você não tem permissão para recuperar este processamento.");
    await capture(viewer, info, "recoverable-viewer-denied");

    const afterDenial = await readJob(viewer, fixture.jobId);
    outcomes.afterDenial = summarize(afterDenial);
    expect(summarize(afterDenial)).toEqual(summarize(before));
  } finally {
    await viewer.context().close();
  }

  const operator = await signIn(browser, fixture.operator, fixture.password);
  try {
    const recoverRequests: number[] = [];
    operator.on("response", response => {
      if (response.url().endsWith(`/api/v1/jobs/${fixture.jobId}/recover`) && response.request().method() === "POST") {
        recoverRequests.push(response.status());
      }
    });
    await openSession(operator, fixture);
    await expect(operator.getByTestId("job-recovery-panel")).toBeVisible();
    await capture(operator, info, "recoverable-operator");

    const accepted = operator.waitForResponse(value => value.url().endsWith(`/api/v1/jobs/${fixture.jobId}/recover`) && value.request().method() === "POST");
    await operator.getByRole("button", { name: "Recuperar processamento" }).dblclick();
    outcomes.operatorRecoverStatus = (await accepted).status();
    expect([200, 202]).toContain(outcomes.operatorRecoverStatus);
    await expect(operator.getByRole("button", { name: "Recuperar processamento" })).toHaveCount(0);
    await capture(operator, info, "recovery-accepted");

    await expect(operator.locator('#job-status-panel [data-slot="badge"]')).toHaveText("Processamento concluído", { timeout: 600_000 });
    await expect(operator.locator('[data-slot="card-title"]', { hasText: /^Resultados$/ })).toBeVisible({ timeout: 60_000 });
    const stages = operator.getByRole("list", { name: "Etapas do processamento" });
    await expect(stages).toBeVisible();
    await expect(stages.getByText("Reconstrução fotogramétrica")).toBeVisible();
    await capture(operator, info, "recovered-completed");
    await operator.screenshot({ path: info.outputPath("recovered-completed-page.png"), fullPage: true });
    outcomes.recoverRequests = recoverRequests;
    expect(recoverRequests).toHaveLength(1);

    const completed = await readJob(operator, fixture.jobId);
    outcomes.completed = summarize(completed);
    expect(completed.jobId).toBe(fixture.jobId);
    expect(completed.status).toBe("COMPLETED");
    expect(completed.stageEvidence).toBe("RECORDED");

    const token = await operator.evaluate(() => localStorage.getItem("buildtwin_token"));
    const latest = await operator.request.get(`${environment.apiURL}/api/v1/capture-sessions/${fixture.captureSessionId}/latest-job`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(latest.status()).toBe(200);
    const latestJob = jobView.parse(await latest.json());
    outcomes.latestJobId = latestJob.jobId;
    expect(latestJob.jobId).toBe(fixture.jobId);
    expect(latestJob.attempt).toEqual(completed.attempt);

    const repeated = await operator.request.post(`${environment.apiURL}/api/v1/jobs/${fixture.jobId}/recover`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    outcomes.repeatedRecoverStatus = repeated.status();
    expect(repeated.status()).toBe(200);
    const afterRepeat = await readJob(operator, fixture.jobId);
    outcomes.afterRepeat = summarize(afterRepeat);
    expect(summarize(afterRepeat)).toEqual(summarize(completed));
  } finally {
    await info.attach("recovery-outcomes.json", { body: JSON.stringify(outcomes, null, 2), contentType: "application/json" });
    await operator.context().close();
  }
});
