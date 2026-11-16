import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { APIResponse, Page } from "@playwright/test";
import { test, expect, login, authorized } from "./fixtures";
import { resolveDeliveryFixtures } from "./lifecycle-data";

const digest = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
test.setTimeout(150_000);

test("should preserve real image and delivery bytes when assignment rights are reduced and revoked", async ({ browser }, info) => {
  const fixture = resolveDeliveryFixtures(process.env);
  const scope = `/api/v1/capture-sessions/${fixture.sessionId}`;
  const image = Buffer.from(fixture.imageBase64, "base64");
  const file = { name: "pilot-original.png", mimeType: "image/png", buffer: image };
  const outcomes: Array<{ path: string; status: number }> = [];
  async function status(response: Pick<APIResponse, "url" | "status">, expected: number) {
    outcomes.push({ path: new URL(response.url()).pathname, status: response.status() });
    expect(response.status()).toBe(expected);
  }
  async function upload(page: Page) {
    const token = await page.evaluate(() => localStorage.getItem("buildtwin_token"));
    return page.request.post(`${scope}/images`, { headers: { Authorization: `Bearer ${token}` }, multipart: { files: file } });
  }
  async function bytes(page: Page, artifact: typeof fixture.preview) {
    const response = await page.request.get(`/api/v1/artifacts/${artifact.id}/download`, { maxRedirects: 0 });
    await status(response, 200);
    const content = await response.body();
    expect(content.length).toBe(artifact.byteLength);
    expect(response.headers()["content-length"]).toBe(String(artifact.byteLength));
    expect(response.headers()["content-type"]).toContain(artifact.id === fixture.raw.id ? "application/octet-stream" : "image/png");
    expect(response.headers()["content-disposition"]).toContain("attachment;");
    expect(digest(content)).toBe(artifact.sha256);
    expect(response.headers()["cache-control"]).toBe("private, no-store");
  }
  try {
    const sut = await login(browser, fixture.operator);
    await sut.goto(`/projects/${fixture.alpha.id}/capture-sessions/${fixture.sessionId}`);
    await sut.locator('input[type="file"]').setInputFiles(file);
    const uploaded = sut.waitForResponse(response => new URL(response.url()).pathname === `${scope}/images` && response.request().method() === "POST");
    await sut.getByRole("button", { name: "Enviar imagens", exact: true }).click();
    await status(await uploaded, 201);
    await expect(sut.getByText("1 de 1 imagens enviadas.", { exact: true })).toBeVisible();
    const imageResponse = await sut.request.get(`${scope}/images`);
    await status(imageResponse, 200);
    const images = await imageResponse.json() as Array<{ id: string; checksum: string; fileSize: number; metadata: { latitude: number | null; longitude: number | null } | null }>;
    expect(images).toHaveLength(1);
    expect(images[0]!.checksum).toBe(digest(image));
    expect(images[0]!.fileSize).toBe(image.length);
    expect((images[0]!.metadata?.latitude ?? null)).toBeNull();
    expect((images[0]!.metadata?.longitude ?? null)).toBeNull();
    await status(await upload(sut), 409);
    const before = await (await sut.request.get(`${scope}/images`)).json();
    expect(before).toEqual(images);
    for (const artifact of [fixture.unassignedPreview, fixture.foreignPreview]) {
      for (const path of [`/api/v1/artifacts/${artifact.id}`, `/api/v1/artifacts/${artifact.id}/download`, `/api/v1/artifacts/${artifact.id}/preview`, `/api/v1/jobs/${artifact.jobId}/artifacts`]) {
        await status(await sut.request.get(path), 404);
      }
    }
    await bytes(sut, fixture.raw);
    const bearer = await sut.evaluate(() => localStorage.getItem("buildtwin_token"));
    const direct = await sut.request.get(`/api/v1/artifacts/${fixture.raw.id}/download`, { headers: { Authorization: `Bearer ${bearer}` } });
    await status(direct, 200);
    expect(digest(await direct.body())).toBe(fixture.raw.sha256);

    const viewer = await login(browser, fixture.viewer);
    await bytes(viewer, fixture.preview);
    await status(await viewer.request.get(`/api/v1/artifacts/${fixture.raw.id}/download`), 403);
    await status(await upload(viewer), 403);
    const download = viewer.waitForEvent("download");
    try {
      await viewer.goto(`/api/v1/artifacts/${fixture.preview.id}/download`);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("net::ERR_ABORTED") && !error.message.includes("Download is starting")) throw error;
    }
    const saved = await download;
    const path = await saved.path();
    expect(path).not.toBeNull();
    expect(digest(await readFile(path!))).toBe(fixture.preview.sha256);
    expect(saved.suggestedFilename()).toBe("fixture.png");
    for (const identity of [fixture.unlinked, fixture.platform]) {
      const denied = await login(browser, identity);
      for (const artifact of [fixture.preview, fixture.raw]) {
        await status(await denied.request.get(`/api/v1/artifacts/${artifact.id}`), 404);
        await status(await denied.request.get(`/api/v1/artifacts/${artifact.id}/download`), 404);
      }
      await denied.context().close();
    }
    const administrator = await login(browser, fixture.administrator);
    await status(await authorized(administrator, "POST", `/api/v1/projects/${fixture.alpha.id}/assignments`, { userId: fixture.operator.id, role: "PROJECT_VIEWER" }), 201);
    await status(await sut.request.get(`/api/v1/artifacts/${fixture.raw.id}/download`), 401);
    const reduced = await login(browser, fixture.operator);
    await bytes(reduced, fixture.preview);
    await status(await reduced.request.get(`/api/v1/artifacts/${fixture.raw.id}/download`), 403);
    await status(await upload(reduced), 403);
    const refreshed = await reduced.request.post("/api/v1/auth/refresh", { data: { refreshToken: await reduced.evaluate(() => localStorage.getItem("buildtwin_refresh")) } });
    await status(refreshed, 200);
    const current = await refreshed.json() as { token: string };
    await status(await reduced.request.get(`/api/v1/artifacts/${fixture.preview.id}/download`, { headers: { Authorization: `Bearer ${current.token}` } }), 200);
    await status(await authorized(administrator, "DELETE", `/api/v1/projects/${fixture.alpha.id}/assignments/${fixture.operator.id}`), 204);
    await status(await reduced.request.get(`/api/v1/artifacts/${fixture.preview.id}/download`, { headers: { Authorization: `Bearer ${current.token}` } }), 401);
    const unassigned = await login(browser, fixture.operator);
    await status(await unassigned.request.get(`/api/v1/artifacts/${fixture.preview.id}/download`), 404);
    await status(await upload(unassigned), 404);
    await bytes(administrator, fixture.preview);
    await bytes(administrator, fixture.raw);
    await bytes(administrator, fixture.unassignedPreview);
    await status(await administrator.request.get(`/api/v1/artifacts/${fixture.foreignPreview.id}/download`), 404);
    expect(await (await administrator.request.get(`${scope}/images`)).json()).toEqual(before);
    const screenshot = info.outputPath("preserved-real-image-after-revocation.png");
    await viewer.goto(`/projects/${fixture.alpha.id}/capture-sessions/${fixture.sessionId}`);
    await viewer.screenshot({ path: screenshot, fullPage: true });
    await info.attach("preserved-real-image", { path: screenshot, contentType: "image/png" });
  } finally {
    await info.attach("delivery-status-matrix", { body: Buffer.from(JSON.stringify(outcomes)), contentType: "application/json" });
    for (const context of browser.contexts()) await context.close();
  }
});
