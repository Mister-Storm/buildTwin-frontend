import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Browser, Page, TestInfo } from "@playwright/test";
import { z } from "zod";
import { test, expect } from "./fixtures";
import { resolveRealBrowserEnvironment } from "./environment";

const identity = z.object({ id: z.string().uuid(), email: z.string().regex(/^pilot-.*@example\.invalid$/) }).strict();
const project = z.object({ id: z.string().uuid(), name: z.string().startsWith("pilot-") }).strict();
const session = z.object({ id: z.string().uuid(), captureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict();
const asset = z.object({
  path: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  byteLength: z.number().int().positive(),
}).strict();
const manifest = z.object({
  kind: z.literal("buildtwin-disposable-upload-acceptance-v1"),
  operator: identity,
  viewer: identity,
  project: project,
  sessions: z.object({
    empty: session,
    original: session,
    duplicate: session,
    viewerDenied: session,
  }).passthrough(),
  assets: z.object({
    gps: asset,
    text: asset,
    original: asset,
  }).passthrough(),
}).passthrough();

type Identity = z.infer<typeof identity>;
type Fixture = z.infer<typeof manifest> & { password: string };

const environment = resolveRealBrowserEnvironment(process.env);
test.describe.configure({ mode: "serial" });
test.setTimeout(240_000);

function resolveFixture(): Fixture {
  const raw = process.env.BUILDTWIN_REAL_UPLOAD_FIXTURES;
  const password = process.env.BUILDTWIN_REAL_USER_PASSWORD;
  if (!raw || !password) throw new Error("Disposable upload fixtures are required for input-error journeys");
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
    throw new Error("Supported input-error login did not complete; credentials redacted");
  }
}

async function openUpload(page: Page, projectId: string, sessionId: string) {
  await page.goto(`/projects/${projectId}/capture-sessions/${sessionId}`);
  await expect(page.getByText("Upload de Imagens", { exact: true })).toBeVisible();
}

async function screenshot(page: Page, info: TestInfo, name: string) {
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
}

test("should surface validation, conflict and forbidden upload errors with support references", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const operator = await signIn(browser, fixture.operator, fixture.password);
  const viewer = await signIn(browser, fixture.viewer, fixture.password);
  try {
    const textPath = path.isAbsolute(fixture.assets.text.path) ? fixture.assets.text.path : path.resolve(fixture.assets.text.path);
    const originalPath = path.isAbsolute(fixture.assets.original.path) ? fixture.assets.original.path : path.resolve(fixture.assets.original.path);
    const gpsPath = path.isAbsolute(fixture.assets.gps.path) ? fixture.assets.gps.path : path.resolve(fixture.assets.gps.path);

    await openUpload(operator, fixture.project.id, fixture.sessions.empty.id);
    await operator.locator('input[type="file"]').setInputFiles({
      name: "text.jpg",
      mimeType: "text/plain",
      buffer: await readFile(textPath),
    });
    await expect(operator.getByText("Formato não suportado. Use JPG ou PNG.")).toBeVisible();
    await screenshot(operator, info, "input-error-client-validation");

    await openUpload(operator, fixture.project.id, fixture.sessions.duplicate.id);
    const conflict = operator.waitForResponse((value) => value.url().includes("/images") && value.request().method() === "POST");
    await operator.locator('input[type="file"]').setInputFiles(originalPath);
    await operator.getByRole("button", { name: "Enviar imagens", exact: true }).click();
    const conflictResponse = await conflict;
    expect(conflictResponse.status()).toBe(409);
    const conflictBody = await conflictResponse.json() as { traceId?: string };
    await expect(operator.getByText(/Imagem duplicada nesta sessão/i).first()).toBeVisible();
    if (conflictBody.traceId) {
      await expect(operator.getByText(new RegExp(`Referência de suporte:\\s*${conflictBody.traceId}`, "i")).first()).toBeVisible();
    }
    await screenshot(operator, info, "input-error-duplicate-conflict");

    await openUpload(viewer, fixture.project.id, fixture.sessions.viewerDenied.id);
    const forbidden = viewer.waitForResponse((value) => value.url().includes("/images") && value.request().method() === "POST");
    await viewer.locator('input[type="file"]').setInputFiles(gpsPath);
    await viewer.getByRole("button", { name: "Enviar imagens", exact: true }).click();
    const forbiddenResponse = await forbidden;
    expect(forbiddenResponse.status()).toBe(403);
    await expect(viewer.getByText(/Sem permissão para enviar imagens neste projeto/i).first()).toBeVisible();
    await expect(viewer).toHaveURL(new RegExp(`/projects/${fixture.project.id}/capture-sessions/${fixture.sessions.viewerDenied.id}`));
    await screenshot(viewer, info, "input-error-forbidden-preserved");
  } finally {
    await operator.context().close();
    await viewer.context().close();
  }
});
