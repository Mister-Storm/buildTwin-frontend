import { test as base, expect, type Browser, type Page } from "@playwright/test";
import { resolveRealBrowserEnvironment } from "./environment";
import { resolveLifecycleFixtures, type LifecycleIdentity } from "./lifecycle-data";

const environment = resolveRealBrowserEnvironment(process.env);
const fixture = () => resolveLifecycleFixtures(process.env);

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, runFixture) => {
    const environment = resolveRealBrowserEnvironment(process.env);
    const email = process.env.BUILDTWIN_REAL_USER_EMAIL;
    const password = process.env.BUILDTWIN_REAL_USER_PASSWORD;
    if (!email || !password) {
      throw new Error("Supported scoped user credentials are required for real browser authentication");
    }
    try {
      for (const origin of [environment.apiURL, environment.baseURL]) {
        const anonymous = await page.request.get(`${origin}/api/v1/projects`, { maxRedirects: 0 });
        if (anonymous.status() !== 401 || !anonymous.headers()["content-type"]?.includes("application/json")) {
          throw new Error("Real browser target must enforce anonymous API denial without mock fallback");
        }
      }
      await page.goto(`${environment.baseURL}/login`);
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Senha", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Entrar", exact: true }).click();
      await page.waitForURL(/\/(admin|dashboard)(?:[/?#]|$)/);
      const response = await page.request.get(`${environment.baseURL}/api/v1/projects`);
      if (response.status() !== 200 || !response.headers()["content-type"]?.includes("application/json")) {
        throw new Error("Protected project listing did not return permitted JSON");
      }
    } catch {
      throw new Error("Real supported authentication and protected access did not complete; credentials redacted");
    }
    await runFixture(page);
    await page.context().clearCookies();
  },
});

export { expect };

export async function login(browser: Browser, identity: LifecycleIdentity): Promise<Page> {
  const context = await browser.newContext({ baseURL: environment.baseURL });
  const page = await context.newPage();
  try {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(identity.email);
    await page.getByLabel("Senha", { exact: true }).fill(fixture().password);
    const response = page.waitForResponse((value) => value.url().endsWith("/api/v1/auth/login") && value.request().method() === "POST");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    expect((await response).status()).toBe(200);
    await page.waitForURL(/\/(admin|dashboard)(?:[/?#]|$)/);
    return page;
  } catch {
    await context.close();
    throw new Error("Supported lifecycle UI login did not complete; credentials redacted");
  }
}

export async function authorized(page: Page, method: "POST" | "PATCH" | "DELETE", path: string, data?: Record<string, unknown>) {
  try {
    const token = await page.evaluate(() => localStorage.getItem("buildtwin_token"));
    if (!token) throw new Error("Missing supported session");
    return await page.request.fetch(path, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      ...(data ? { data } : {}),
    });
  } catch {
    throw new Error("Supported administrative fixture request did not complete; credentials redacted");
  }
}

export async function showProject(page: Page, project: { id: string; name: string }) {
  await page.goto(`/projects/${project.id}`);
  await expect(page.getByRole("heading", { name: project.name, exact: true }).first()).toBeVisible();
  expect((await page.request.get(`/api/v1/projects/${project.id}`)).status()).toBe(200);
}

export async function activeBeforeChange(page: Page) {
  const expires = await page.evaluate(() => {
    const token = localStorage.getItem("buildtwin_token");
    const payload = token?.split(".")[1];
    if (!payload) return 0;
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return claims.exp ?? 0;
  });
  expect(expires).toBeGreaterThan(Math.ceil(Date.now() / 1000) + 5);
}

export async function openCapture(page: Page, marker: string) {
  await page.getByRole("button", { name: /^(Nova Captura|Criar primeira captura)$/i }).first().click();
  await page.getByLabel("Operador", { exact: true }).fill(marker);
}

export async function submitCapture(page: Page, projectId: string) {
  const response = page.waitForResponse((value) => new URL(value.url()).pathname === `/api/v1/projects/${projectId}/capture-sessions` && value.request().method() === "POST");
  await page.getByRole("button", { name: "Criar captura", exact: true }).click();
  return response;
}

export async function createCapture(page: Page, projectId: string, marker: string) {
  await openCapture(page, marker);
  const response = await submitCapture(page, projectId);
  expect(response.status()).toBe(201);
  const created = await response.json() as { id: string };
  const stored = await page.request.get(`/api/v1/capture-sessions/${created.id}`);
  expect(stored.status()).toBe(200);
  expect((await stored.json() as { operatorName: string }).operatorName).toBe(marker);
  await expect(page.locator(`a[href*="/capture-sessions/${created.id}"]`).first()).toBeVisible();
}
