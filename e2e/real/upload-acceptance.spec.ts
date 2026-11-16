import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { APIResponse, Browser, Page, TestInfo } from "@playwright/test";
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
  secondOperator: identity,
  viewer: identity,
  foreign: identity,
  project: project,
  foreignProject: project,
  sessions: z.object({
    empty: session,
    original: session,
    concurrent: session,
    duplicate: session,
    viewerDenied: session,
  }).strict(),
  assets: z.object({
    gps: asset,
    noGps: asset,
    png: asset,
    concurrentA: asset,
    concurrentB: asset,
    original: asset,
    text: asset,
  }).strict(),
  originalImageId: z.string().uuid(),
  raceSessionId: z.string().uuid().optional(),
}).strict();

type Identity = z.infer<typeof identity>;
type Fixture = z.infer<typeof manifest> & { password: string };
type ListedImage = {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  checksum: string;
  storagePath: string;
  metadata: { latitude: number | null; longitude: number | null } | null;
};

const environment = resolveRealBrowserEnvironment(process.env);
const outcomes: Array<Record<string, unknown>> = [];
test.describe.configure({ mode: "serial" });
test.setTimeout(300_000);

function resolveFixture(): Fixture {
  const raw = process.env.BUILDTWIN_REAL_UPLOAD_FIXTURES;
  const password = process.env.BUILDTWIN_REAL_USER_PASSWORD;
  if (!raw || !password) throw new Error("Disposable upload acceptance fixtures are required");
  return { ...manifest.parse(JSON.parse(raw)), password };
}

function digest(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
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
    throw new Error("Supported upload acceptance login did not complete; credentials redacted");
  }
}

async function bearer(page: Page): Promise<string> {
  const token = await page.evaluate(() => localStorage.getItem("buildtwin_token"));
  if (!token) throw new Error("Missing supported session");
  return token;
}

async function api(
  page: Page,
  actor: string,
  method: "GET" | "POST" | "DELETE",
  pathName: string,
  data?: unknown,
): Promise<APIResponse> {
  const token = await bearer(page);
  const response = await page.request.fetch(`${environment.apiURL}${pathName}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    maxRedirects: 0,
    ...(data === undefined ? {} : { data }),
  });
  outcomes.push({ actor, method, path: pathName, status: response.status() });
  return response;
}

async function listImages(page: Page, actor: string, sessionId: string): Promise<ListedImage[]> {
  const response = await api(page, actor, "GET", `/api/v1/capture-sessions/${sessionId}/images`);
  expect(response.status(), `${actor} list images`).toBe(200);
  return (await response.json()) as ListedImage[];
}

async function openUpload(page: Page, projectId: string, sessionId: string) {
  await page.goto(`/projects/${projectId}/capture-sessions/${sessionId}`);
  await expect(page.getByText("Upload de Imagens", { exact: true })).toBeVisible();
}

async function uploadViaUi(page: Page, files: string[]) {
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(files);
  const response = page.waitForResponse(
    (value) => value.url().includes("/images") && value.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Enviar imagens", exact: true }).click();
  return response;
}

async function screenshot(page: Page, info: TestInfo, name: string) {
  const target = info.outputPath(`${name}.png`);
  await page.screenshot({ path: target, fullPage: true });
  return target;
}

async function loadAsset(asset: z.infer<typeof asset>) {
  const absolute = path.isAbsolute(asset.path) ? asset.path : path.resolve(asset.path);
  const buffer = await readFile(absolute);
  expect(buffer.length).toBe(asset.byteLength);
  expect(digest(buffer)).toBe(asset.sha256);
  return { absolute, buffer };
}

test.afterAll(async ({}, info) => {
  await info.attach("upload-acceptance-outcomes.json", {
    body: Buffer.from(JSON.stringify(outcomes, null, 2)),
    contentType: "application/json",
  });
});

test("should accept genuine gps and no-gps uploads through the browser and retain listed checksums", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const operator = await signIn(browser, fixture.operator, fixture.password);
  try {
    const gps = await loadAsset(fixture.assets.gps);
    const noGps = await loadAsset(fixture.assets.noGps);
    await openUpload(operator, fixture.project.id, fixture.sessions.empty.id);
    const response = await uploadViaUi(operator, [gps.absolute, noGps.absolute]);
    expect(response.status()).toBe(201);
    const body = (await response.json()) as Array<{ imageId: string; fileName: string; storagePath: string }>;
    expect(body).toHaveLength(2);
    await expect(operator.getByText(/2 de 2 imagens enviadas/i)).toBeVisible();
    const listed = await listImages(operator, "operator", fixture.sessions.empty.id);
    expect(listed).toHaveLength(2);
    const byChecksum = new Map(listed.map((image) => [image.checksum, image]));
    expect(byChecksum.get(fixture.assets.gps.sha256)?.fileSize).toBe(fixture.assets.gps.byteLength);
    expect(byChecksum.get(fixture.assets.noGps.sha256)?.fileSize).toBe(fixture.assets.noGps.byteLength);
    expect(byChecksum.get(fixture.assets.gps.sha256)?.metadata?.latitude).not.toBeNull();
    expect(byChecksum.get(fixture.assets.noGps.sha256)?.metadata?.latitude ?? null).toBeNull();
    await screenshot(operator, info, "operator-accepted-gps-and-nogps");
  } finally {
    await operator.context().close();
  }
});

test("should reject invalid client files without losing the capture session workspace", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const operator = await signIn(browser, fixture.operator, fixture.password);
  try {
    const text = await loadAsset(fixture.assets.text);
    await openUpload(operator, fixture.project.id, fixture.sessions.original.id);
    const before = await listImages(operator, "operator", fixture.sessions.original.id);
    expect(before.some((image) => image.id === fixture.originalImageId)).toBe(true);
    await operator.locator('input[type="file"]').setInputFiles({
      name: text.absolute.endsWith(".jpg") ? "text.jpg" : fixture.assets.text.fileName,
      mimeType: "text/plain",
      buffer: text.buffer,
    });
    await expect(operator.getByText("Formato não suportado. Use JPG ou PNG.")).toBeVisible();
    await expect(operator.getByRole("button", { name: "Enviar imagens", exact: true })).toBeDisabled();
    const after = await listImages(operator, "operator", fixture.sessions.original.id);
    expect(after.map((image) => image.id).sort()).toEqual(before.map((image) => image.id).sort());
    await expect(operator.getByText("Upload de Imagens", { exact: true })).toBeVisible();
    await screenshot(operator, info, "operator-invalid-client-file-preserved-session");
  } finally {
    await operator.context().close();
  }
});

test("should show duplicate conflict with support trace without removing the original image", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const operator = await signIn(browser, fixture.operator, fixture.password);
  try {
    const original = await loadAsset(fixture.assets.original);
    await openUpload(operator, fixture.project.id, fixture.sessions.duplicate.id);
    const before = await listImages(operator, "operator", fixture.sessions.duplicate.id);
    expect(before).toHaveLength(1);
    expect(before[0]?.checksum).toBe(fixture.assets.original.sha256);
    const response = await uploadViaUi(operator, [original.absolute]);
    expect(response.status()).toBe(409);
    const envelope = await response.json() as { error?: string; traceId?: string; message?: string };
    expect(envelope.error).toBe("CONFLICT");
    expect(envelope.traceId).toMatch(/^[0-9a-f-]{8,}$/i);
    await expect(operator.getByText(/Imagem duplicada nesta sessão/i).first()).toBeVisible();
    await expect(operator.getByText(new RegExp(`Referência de suporte:\\s*${envelope.traceId}`, "i")).first()).toBeVisible();
    const after = await listImages(operator, "operator", fixture.sessions.duplicate.id);
    expect(after).toHaveLength(1);
    expect(after[0]?.id).toBe(before[0]?.id);
    expect(after[0]?.checksum).toBe(fixture.assets.original.sha256);
    await screenshot(operator, info, "operator-duplicate-conflict-with-trace");
  } finally {
    await operator.context().close();
  }
});

test("should deny viewer upload while preserving the signed-in session and original bytes metadata", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const viewer = await signIn(browser, fixture.viewer, fixture.password);
  try {
    const gps = await loadAsset(fixture.assets.gps);
    await openUpload(viewer, fixture.project.id, fixture.sessions.viewerDenied.id);
    const listedBefore = await listImages(viewer, "viewer", fixture.sessions.viewerDenied.id);
    expect(listedBefore.length).toBeGreaterThanOrEqual(1);
    const response = await uploadViaUi(viewer, [gps.absolute]);
    expect(response.status()).toBe(403);
    const envelope = await response.json() as { error?: string; traceId?: string };
    expect(envelope.error).toBe("FORBIDDEN");
    await expect(viewer.getByText(/Sem permissão para enviar imagens neste projeto/i).first()).toBeVisible();
    expect(await bearer(viewer)).toBeTruthy();
    await expect(viewer).toHaveURL(new RegExp(`/projects/${fixture.project.id}/capture-sessions/${fixture.sessions.viewerDenied.id}`));
    const listedAfter = await listImages(viewer, "viewer", fixture.sessions.viewerDenied.id);
    expect(listedAfter.map((image) => image.checksum).sort()).toEqual(listedBefore.map((image) => image.checksum).sort());
    await screenshot(viewer, info, "viewer-forbidden-upload-session-preserved");
  } finally {
    await viewer.context().close();
  }
});

test("should preserve original and both new links when two operators upload distinct images concurrently", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const first = await signIn(browser, fixture.operator, fixture.password);
  const second = await signIn(browser, fixture.secondOperator, fixture.password);
  try {
    const assetA = await loadAsset(fixture.assets.concurrentA);
    const assetB = await loadAsset(fixture.assets.concurrentB);
    const before = await listImages(first, "operator", fixture.sessions.concurrent.id);
    expect(before.some((image) => image.checksum === fixture.assets.original.sha256)).toBe(true);
    await openUpload(first, fixture.project.id, fixture.sessions.concurrent.id);
    await openUpload(second, fixture.project.id, fixture.sessions.concurrent.id);
    const firstReady = first.locator('input[type="file"]');
    const secondReady = second.locator('input[type="file"]');
    await firstReady.setInputFiles(assetA.absolute);
    await secondReady.setInputFiles(assetB.absolute);
    const firstResponse = first.waitForResponse((value) => value.url().includes("/images") && value.request().method() === "POST");
    const secondResponse = second.waitForResponse((value) => value.url().includes("/images") && value.request().method() === "POST");
    await Promise.all([
      first.getByRole("button", { name: "Enviar imagens", exact: true }).click(),
      second.getByRole("button", { name: "Enviar imagens", exact: true }).click(),
    ]);
    const statuses = [(await firstResponse).status(), (await secondResponse).status()].sort();
    expect(statuses).toEqual([201, 201]);
    const listed = await listImages(first, "operator", fixture.sessions.concurrent.id);
    const checksums = new Set(listed.map((image) => image.checksum));
    expect(checksums.has(fixture.assets.original.sha256)).toBe(true);
    expect(checksums.has(fixture.assets.concurrentA.sha256)).toBe(true);
    expect(checksums.has(fixture.assets.concurrentB.sha256)).toBe(true);
    expect(listed.length).toBeGreaterThanOrEqual(3);
    await screenshot(first, info, "operator-concurrent-upload-retained");
    await screenshot(second, info, "second-operator-concurrent-upload-retained");
  } finally {
    await first.context().close();
    await second.context().close();
  }
});

test("should keep remaining operator access after foreign denial and support a fresh login", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const foreign = await signIn(browser, fixture.foreign, fixture.password);
  const operator = await signIn(browser, fixture.operator, fixture.password);
  try {
    const denied = await api(foreign, "foreign", "GET", `/api/v1/capture-sessions/${fixture.sessions.original.id}/images`);
    expect([403, 404]).toContain(denied.status());
    const listed = await listImages(operator, "operator", fixture.sessions.original.id);
    expect(listed.some((image) => image.id === fixture.originalImageId)).toBe(true);
    await operator.context().clearCookies();
    await operator.evaluate(() => {
      localStorage.removeItem("buildtwin_token");
      localStorage.removeItem("buildtwin_refresh_token");
    });
    await operator.goto("/login");
    await operator.getByLabel("Email", { exact: true }).fill(fixture.operator.email);
    await operator.getByLabel("Senha", { exact: true }).fill(fixture.password);
    const login = operator.waitForResponse((value) => value.url().endsWith("/api/v1/auth/login") && value.request().method() === "POST");
    await operator.getByRole("button", { name: "Entrar", exact: true }).click();
    expect((await login).status()).toBe(200);
    await operator.waitForURL(/\/(admin|dashboard)(?:[/?#]|$)/);
    const afterLogin = await listImages(operator, "operator-relogin", fixture.sessions.original.id);
    expect(afterLogin.some((image) => image.id === fixture.originalImageId && image.checksum === fixture.assets.original.sha256)).toBe(true);
    await screenshot(operator, info, "operator-remaining-access-after-relogin");
  } finally {
    await foreign.context().close();
    await operator.context().close();
  }
});
