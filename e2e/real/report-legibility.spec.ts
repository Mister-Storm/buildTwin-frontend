import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import type { APIResponse, Browser, Page, TestInfo } from "@playwright/test";
import { z } from "zod";
import { test, expect } from "./fixtures";
import { resolveRealBrowserEnvironment } from "./environment";

const identity = z.object({ id: z.string().uuid(), email: z.string().regex(/^pilot-.*@example\.invalid$/) }).strict();
const project = z.object({ id: z.string().uuid(), name: z.string().startsWith("pilot-") }).strict();
const deliverable = z.object({
  id: z.string().uuid(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  byteLength: z.number().int().positive(),
  purpose: z.enum(["FALLBACK_VISUAL_EVIDENCE", "TECHNICAL_PHOTOGRAMMETRY"]).nullable(),
  processingProfile: z.string().nullable(),
  purposeLabel: z.string().min(1),
  limitationLabels: z.array(z.string()).min(1),
}).strict();
const manifest = z.object({
  kind: z.literal("buildtwin-disposable-report-legibility-v1"),
  operator: identity,
  viewer: identity,
  foreign: identity,
  project: project,
  captureSessionId: z.string().uuid(),
  report: deliverable,
  technicalReport: deliverable.optional(),
}).strict();

type Identity = z.infer<typeof identity>;
type Fixture = z.infer<typeof manifest> & { password: string };

const environment = resolveRealBrowserEnvironment(process.env);
const outcomes: Array<Record<string, unknown>> = [];
test.setTimeout(300_000);

function resolveFixture(): Fixture {
  const raw = process.env.BUILDTWIN_REAL_REPORT_FIXTURES;
  const password = process.env.BUILDTWIN_REAL_USER_PASSWORD;
  if (!raw || !password) throw new Error("Disposable report legibility fixtures are required");
  return { ...manifest.parse(JSON.parse(raw)), password };
}

function digest(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function signIn(browser: Browser, user: Identity, password: string): Promise<Page> {
  const context = await browser.newContext({ baseURL: environment.baseURL, acceptDownloads: true });
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
    throw new Error("Supported report legibility login did not complete; credentials redacted");
  }
}

async function status(actor: string, channel: string, response: Pick<APIResponse, "url" | "status">, expected: number) {
  outcomes.push({ actor, channel, path: new URL(response.url()).pathname, status: response.status() });
  expect(response.status()).toBe(expected);
}

test("should deliver a fallback report through the cookie session with honest purpose labels and readable pages", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const viewer = await signIn(browser, fixture.viewer, fixture.password);
  const foreign = await signIn(browser, fixture.foreign, fixture.password);
  try {
    await viewer.goto(`/projects/${fixture.project.id}/capture-sessions/${fixture.captureSessionId}`);
    await expect(viewer.getByText(new RegExp(`${fixture.report.purposeLabel}.*perfil FALLBACK`, "i"))).toBeVisible();
    for (const label of fixture.report.limitationLabels) {
      await expect(viewer.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(viewer.getByText(/avaliação executiva de progresso/i)).toBeVisible();
    await expect(viewer.getByText(/EXECUTIVE_CONSTRUCTION_PROGRESS/i)).toHaveCount(0);
    await expect(viewer.getByRole("link", { name: `Baixar ${fixture.report.purposeLabel}` })).toBeVisible();
    const screenshot = info.outputPath("viewer-report-purpose-labels.png");
    await viewer.screenshot({ path: screenshot, fullPage: true });
    await info.attach("viewer-report-purpose-labels", { path: screenshot, contentType: "image/png" });

    const download = await viewer.request.get(`/api/v1/artifacts/${fixture.report.id}/download`);
    await status("viewer", "cookie", download, 200);
    const bytes = Buffer.from(await download.body());
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(bytes.length).toBe(fixture.report.byteLength);
    expect(digest(bytes)).toBe(fixture.report.sha256);
    expect(download.headers()["content-type"]).toContain("application/pdf");
    expect(download.headers()["cache-control"]).toBe("private, no-store");

    const pdfPath = info.outputPath("fallback-report.pdf");
    await writeFile(pdfPath, bytes);
    await info.attach("fallback-report", { path: pdfPath, contentType: "application/pdf" });

    const pageMarkers = bytes.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? [];
    expect(pageMarkers.length).toBeGreaterThan(0);
    const latin = bytes.toString("latin1");
    expect(latin).toMatch(/FALLBACK|conting|Evid/i);
    expect(latin).not.toMatch(/EXECUTIVE_CONSTRUCTION_PROGRESS/);
    const inspection = {
      pageObjectCount: pageMarkers.length,
      byteLength: bytes.length,
      sha256: digest(bytes),
      containsFallbackMarker: /FALLBACK|conting|Evid/i.test(latin),
    };
    await info.attach("pdf-page-inspection.json", {
      body: Buffer.from(JSON.stringify(inspection, null, 2)),
      contentType: "application/json",
    });

    await status("foreign", "cookie", await foreign.request.get(`/api/v1/artifacts/${fixture.report.id}/download`), 404);
    if (fixture.technicalReport) {
      const technical = await viewer.request.get(`/api/v1/artifacts/${fixture.technicalReport.id}/download`);
      await status("viewer", "cookie-technical", technical, 200);
      expect(digest(Buffer.from(await technical.body()))).toBe(fixture.technicalReport.sha256);
    }
  } finally {
    await info.attach("report-legibility-outcomes.json", {
      body: Buffer.from(JSON.stringify(outcomes, null, 2)),
      contentType: "application/json",
    });
    await viewer.context().close();
    await foreign.context().close();
  }
});
