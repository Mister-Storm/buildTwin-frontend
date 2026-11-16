import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { APIResponse, Browser, Page, Response } from "@playwright/test";
import { z } from "zod";
import { test, expect } from "./fixtures";
import { resolveRealBrowserEnvironment } from "./environment";

const identity = z.object({ id: z.string().uuid(), email: z.string().regex(/^pilot-.*@example\.invalid$/) });
const deliverable = z.object({ id: z.string().uuid(), sha256: z.string().regex(/^[a-f0-9]{64}$/), byteLength: z.number().int().positive() });
const manifest = z.object({
  kind: z.literal("buildtwin-disposable-artifact-delivery-v1"),
  alpha: z.object({ id: z.string().uuid(), name: z.string().startsWith("pilot-") }),
  viewer: identity,
  operator: identity,
  administrator: identity,
  unlinked: identity,
  platform: identity,
  sessionA: z.string().uuid(),
  sessionB: z.string().uuid(),
  foreignSession: z.string().uuid(),
  foreignHeatmapId: z.string().uuid(),
  report: deliverable,
  raw: deliverable,
});
type Identity = z.infer<typeof identity>;

const digest = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const environment = resolveRealBrowserEnvironment(process.env);
test.setTimeout(240_000);

function resolveFixture() {
  const raw = process.env.BUILDTWIN_REAL_ARTIFACT_FIXTURES;
  const password = process.env.BUILDTWIN_REAL_USER_PASSWORD;
  if (!raw || !password) throw new Error("Disposable artifact delivery fixtures are required");
  return { ...manifest.parse(JSON.parse(raw)), password };
}

async function signIn(browser: Browser, user: Identity, password: string): Promise<Page> {
  const context = await browser.newContext({ baseURL: environment.baseURL, acceptDownloads: true });
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
    throw new Error("Supported artifact delivery login did not complete; credentials redacted");
  }
}

const bearerOf = (page: Page) => page.evaluate(() => localStorage.getItem("buildtwin_token"));

test("should deliver an owned real comparison heatmap and client deliverables while hiding raw and foreign artifacts", async ({ browser }, info) => {
  const fixture = resolveFixture();
  const outcomes: Array<{ identity: string; channel: string; path: string; status: number; sha256?: string }> = [];
  async function status(who: string, channel: string, response: Pick<APIResponse, "url" | "status">, expected: number) {
    outcomes.push({ identity: who, channel, path: new URL(response.url()).pathname, status: response.status() });
    expect(response.status()).toBe(expected);
  }
  async function delivered(who: string, channel: string, response: APIResponse, expected: { sha256: string; byteLength: number; type: string }) {
    await status(who, channel, response, 200);
    const content = await response.body();
    const hash = digest(content);
    outcomes[outcomes.length - 1]!.sha256 = hash;
    expect(hash).toBe(expected.sha256);
    expect(content.length).toBe(expected.byteLength);
    expect(response.headers()["content-length"]).toBe(String(expected.byteLength));
    expect(response.headers()["content-type"]).toContain(expected.type);
    expect(response.headers()["cache-control"]).toBe("private, no-store");
    return content;
  }
  async function saved(page: Page, path: string) {
    const download = page.waitForEvent("download");
    try {
      await page.goto(path);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("net::ERR_ABORTED") && !error.message.includes("Download is starting")) throw error;
    }
    const event = await download;
    const file = await event.path();
    expect(file).not.toBeNull();
    return { name: event.suggestedFilename(), sha256: digest(await readFile(file!)) };
  }
  try {
    const expiring = await signIn(browser, fixture.administrator, fixture.password);
    const expiringToken = (await bearerOf(expiring))!;
    await expiring.context().close();
    const viewer = await signIn(browser, fixture.viewer, fixture.password);
    const comparePath = `/projects/${fixture.alpha.id}/compare?captureSessionA=${fixture.sessionA}&captureSessionB=${fixture.sessionB}`;
    const browserPreviews = new Map<string, Response>();
    viewer.on("response", response => {
      const path = new URL(response.url()).pathname;
      if (path.startsWith("/preview/artifacts/")) browserPreviews.set(path, response);
    });
    await viewer.goto(`/projects/${fixture.alpha.id}`);
    await viewer.getByRole("link", { name: "Comparar levantamentos", exact: true }).click();
    await viewer.waitForURL(url => url.pathname === `/projects/${fixture.alpha.id}/compare`, { timeout: 120_000 });
    const heatmapImage = viewer.getByRole("img", { name: "Mapa de calor das mudanças detectadas" });
    await expect(heatmapImage).toBeVisible({ timeout: 120_000 });
    await expect.poll(() => heatmapImage.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const heatmapPath = new URL((await heatmapImage.getAttribute("src"))!, environment.baseURL).pathname;
    const heatmapId = heatmapPath.split("/").pop()!;
    await expect.poll(() => browserPreviews.has(heatmapPath)).toBe(true);
    const preview = browserPreviews.get(heatmapPath)!;
    await status("viewer", "browser-image-proxy", preview, 200);
    expect(preview.headers()["cache-control"]).toBe("private, no-store");
    expect(preview.headers()["content-type"]).toContain("image/jpeg");
    const screenshot = info.outputPath("viewer-comparison-heatmap.png");
    await viewer.screenshot({ path: screenshot, fullPage: true });
    await info.attach("viewer-comparison-heatmap", { path: screenshot, contentType: "image/png" });

    const metadataResponse = await viewer.request.get(`/api/v1/artifacts/${heatmapId}`);
    await status("viewer", "cookie", metadataResponse, 200);
    const metadata = await metadataResponse.json() as { artifactType: string; checksum: string; fileSize: number };
    expect(metadata.artifactType).toBe("CHANGE_HEATMAP");
    const heatmap = { sha256: metadata.checksum, byteLength: metadata.fileSize, type: "image/jpeg" };
    expect(digest(await preview.body())).toBe(heatmap.sha256);
    await delivered("viewer", "cookie", await viewer.request.get(`/api/v1/artifacts/${heatmapId}/download`), heatmap);
    await delivered("viewer", "cookie-proxy", await viewer.request.get(`/preview/artifacts/${heatmapId}`), heatmap);
    const viewerBearer = await bearerOf(viewer);
    await delivered("viewer", "bearer", await viewer.request.get(`${environment.apiURL}/api/v1/artifacts/${heatmapId}/download`, {
      headers: { Authorization: `Bearer ${viewerBearer}` },
    }), heatmap);
    const revisit = await viewer.request.get(`/api/v1/projects/${fixture.alpha.id}/compare?captureSessionA=${fixture.sessionA}&captureSessionB=${fixture.sessionB}`);
    await status("viewer", "cookie", revisit, 200);
    expect((await revisit.json() as { heatmapArtifactId: string }).heatmapArtifactId).toBe(heatmapId);
    const heatmapFile = await saved(viewer, `/api/v1/artifacts/${heatmapId}/download`);
    expect(heatmapFile.sha256).toBe(heatmap.sha256);

    const report = { ...fixture.report, type: "application/pdf" };
    const pdf = await delivered("viewer", "cookie", await viewer.request.get(`/api/v1/artifacts/${fixture.report.id}/download`), report);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    const reportFile = await saved(viewer, `/api/v1/artifacts/${fixture.report.id}/download`);
    expect(reportFile).toEqual({ name: "report.pdf", sha256: fixture.report.sha256 });

    await status("viewer", "cookie", await viewer.request.get(`/api/v1/artifacts/${fixture.raw.id}/download`), 403);
    await status("viewer", "bearer", await viewer.request.get(`${environment.apiURL}/api/v1/artifacts/${fixture.raw.id}/download`, {
      headers: { Authorization: `Bearer ${viewerBearer}` },
    }), 403);
    async function rawPreviewRefused(who: string, page: Page) {
      const response = await page.request.get(`/preview/artifacts/${fixture.raw.id}`);
      await status(who, "cookie-proxy", response, 400);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect((await response.body()).includes(Buffer.from("end_header"))).toBe(false);
    }
    await rawPreviewRefused("viewer", viewer);
    for (const path of [`/api/v1/artifacts/${fixture.foreignHeatmapId}`, `/api/v1/artifacts/${fixture.foreignHeatmapId}/download`, `/preview/artifacts/${fixture.foreignHeatmapId}`]) {
      await status("viewer", "cookie", await viewer.request.get(path), 404);
    }
    await status("viewer", "cookie", await viewer.request.get(`/api/v1/projects/${fixture.alpha.id}/compare?captureSessionA=${fixture.sessionA}&captureSessionB=${fixture.foreignSession}`), 404);

    const operator = await signIn(browser, fixture.operator, fixture.password);
    await delivered("operator", "cookie", await operator.request.get(`/api/v1/artifacts/${fixture.raw.id}/download`), { ...fixture.raw, type: "application/octet-stream" });
    await delivered("operator", "bearer", await operator.request.get(`${environment.apiURL}/api/v1/artifacts/${fixture.raw.id}/download`, {
      headers: { Authorization: `Bearer ${await bearerOf(operator)}` },
    }), { ...fixture.raw, type: "application/octet-stream" });
    await rawPreviewRefused("operator", operator);
    const rawFile = await saved(operator, `/api/v1/artifacts/${fixture.raw.id}/download`);
    expect(rawFile).toEqual({ name: "cloud.ply", sha256: fixture.raw.sha256 });

    for (const [name, user] of [["unlinked", fixture.unlinked], ["platform", fixture.platform]] as const) {
      const denied = await signIn(browser, user, fixture.password);
      for (const id of [heatmapId, fixture.report.id, fixture.raw.id]) {
        await status(name, "cookie", await denied.request.get(`/api/v1/artifacts/${id}`), 404);
        await status(name, "cookie", await denied.request.get(`/api/v1/artifacts/${id}/download`), 404);
      }
      await status(name, "cookie-proxy", await denied.request.get(`/preview/artifacts/${heatmapId}`), 404);
      await denied.context().close();
    }
    const anonymous = await browser.newContext({ baseURL: environment.baseURL });
    await status("anonymous", "none", await anonymous.request.get(`/api/v1/artifacts/${heatmapId}/download`), 401);
    const anonymousPreview = await anonymous.request.get(`/preview/artifacts/${heatmapId}`, { maxRedirects: 0 });
    await status("anonymous", "none", anonymousPreview, 307);
    expect(new URL(anonymousPreview.headers()["location"]!, environment.baseURL).pathname).toBe("/login");
    expect(anonymousPreview.headers()["content-type"] ?? "").not.toContain("image/");
    await anonymous.close();

    const administrator = await signIn(browser, fixture.administrator, fixture.password);
    const revoked = await administrator.request.fetch(`/api/v1/projects/${fixture.alpha.id}/assignments/${fixture.viewer.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${await bearerOf(administrator)}` },
    });
    await status("administrator", "bearer", revoked, 204);
    await status("viewer", "saved-link-cookie", await viewer.request.get(`/api/v1/artifacts/${heatmapId}/download`), 401);
    await status("viewer", "saved-link-proxy", await viewer.request.get(`/preview/artifacts/${heatmapId}`), 401);
    await status("viewer", "saved-link-bearer", await viewer.request.get(`${environment.apiURL}/api/v1/artifacts/${fixture.report.id}/download`, {
      headers: { Authorization: `Bearer ${viewerBearer}` },
    }), 401);
    const relogged = await signIn(browser, fixture.viewer, fixture.password);
    for (const id of [heatmapId, fixture.report.id]) {
      await status("viewer", "fresh-cookie", await relogged.request.get(`/api/v1/artifacts/${id}/download`), 404);
    }
    await status("viewer", "fresh-proxy", await relogged.request.get(`/preview/artifacts/${heatmapId}`), 404);
    await status("viewer", "fresh-cookie", await relogged.request.get(comparePath.replace("/projects/", "/api/v1/projects/")), 404);
    await delivered("administrator", "cookie", await administrator.request.get(`/api/v1/artifacts/${heatmapId}/download`), heatmap);
    const expiresAt = (JSON.parse(Buffer.from(expiringToken.split(".")[1]!, "base64url").toString()) as { exp: number }).exp * 1000;
    await viewer.waitForTimeout(Math.max(0, expiresAt - Date.now() + 1_500));
    await status("expired", "bearer", await administrator.request.get(`${environment.apiURL}/api/v1/artifacts/${heatmapId}/download`, {
      headers: { Authorization: `Bearer ${expiringToken}` },
    }), 401);
    const savedSession = await browser.newContext({ baseURL: environment.baseURL });
    await savedSession.addCookies([{ name: "buildtwin_token", value: expiringToken, url: environment.baseURL }]);
    await status("expired", "saved-link-cookie", await savedSession.request.get(`/api/v1/artifacts/${fixture.report.id}/download`), 401);
    await status("expired", "saved-link-proxy", await savedSession.request.get(`/preview/artifacts/${heatmapId}`, { maxRedirects: 0 }), 401);
    await savedSession.close();
    await info.attach("artifact-files", { body: Buffer.from(JSON.stringify({ heatmapId, heatmapFile, reportFile, rawFile })), contentType: "application/json" });
  } finally {
    await info.attach("artifact-status-matrix", { body: Buffer.from(JSON.stringify(outcomes)), contentType: "application/json" });
    for (const context of browser.contexts()) await context.close();
  }
});
