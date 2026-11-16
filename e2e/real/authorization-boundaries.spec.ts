import type { APIResponse, Page, TestInfo } from "@playwright/test";
import { test, expect, login, authorized, showProject, createCapture } from "./fixtures";
import { resolveLifecycleFixtures } from "./lifecycle-data";
import { resolveRealBrowserEnvironment } from "./environment";

const environment = resolveRealBrowserEnvironment(process.env);
const fixtures = () => resolveLifecycleFixtures(process.env);
let outcomes: Array<{ actor: string; method: string; path: string; status: number }> = [];

test.setTimeout(150_000);

async function request(page: Page, actor: string, method: string, path: string, data?: Record<string, unknown>): Promise<APIResponse> {
  const response = method === "POST" || method === "PATCH" || method === "DELETE"
    ? await authorized(page, method, path, data)
    : await page.request.fetch(path, { method, maxRedirects: 0 });
  outcomes.push({ actor, method, path, status: response.status() });
  return response;
}

async function screenshot(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await info.attach(name, { path, contentType: "image/png" });
}

async function projects(page: Page, actor: string) {
  const response = await request(page, actor, "GET", "/api/v1/projects");
  expect(response.status()).toBe(200);
  return await response.json() as Array<{ id: string; name: string }>;
}

test.beforeEach(async ({ request: anonymous }) => {
  outcomes = [];
  for (const origin of [environment.baseURL, environment.apiURL]) {
    const readiness = await anonymous.get(`${origin}/api/v1/system/readiness`, { maxRedirects: 0 });
    expect(readiness.status()).toBe(200);
    const body = await readiness.json() as Record<string, unknown>;
    expect(Object.keys(body)).toEqual(["status"]);
    expect(["UP", "DOWN", "DEGRADED"]).toContain(body.status);
    for (const path of ["/api/v1/projects", "/api/v1/system/overview", "/api/v1/system/operations-summary"]) {
      const response = await anonymous.get(`${origin}${path}`, { maxRedirects: 0 });
      outcomes.push({ actor: "anonymous", method: "GET", path, status: response.status() });
      expect(response.status()).toBe(401);
      expect(response.headers()["content-type"]).toContain("application/json");
    }
  }
});

test.afterEach(async ({ browser }, info) => {
  await info.attach("scope-status-matrix", { body: Buffer.from(JSON.stringify(outcomes)), contentType: "application/json" });
  for (const context of browser.contexts()) await context.close();
});

test("should show only assigned projects and scoped summaries when a viewer navigates the real UI", async ({ browser }, info) => {
  const scope = fixtures().cases.unchanged;
  const sut = await login(browser, scope.viewer);
  await sut.goto("/projects");
  await expect(sut.getByText(scope.alpha.name, { exact: true }).first()).toBeVisible();
  await expect(sut.getByText(scope.beta.name, { exact: true })).toHaveCount(0);
  await expect(sut.getByText("Obra Integração", { exact: true })).toHaveCount(0);
  expect((await projects(sut, "viewer")).map((p) => p.id)).toEqual([scope.alpha.id]);
  for (const id of [scope.beta.id, scope.gamma.id]) {
    expect((await request(sut, "viewer", "GET", `/api/v1/projects/${id}`)).status()).toBe(404);
    expect((await request(sut, "viewer", "GET", `/api/v1/drone-mission?projectId=${id}`)).status()).toBe(404);
  }
  expect((await request(sut, "viewer", "GET", "/api/v1/admin/users")).status()).toBe(403);
  const summary = await request(sut, "viewer", "GET", "/api/v1/system/operations-summary");
  expect(summary.status()).toBe(200);
  const operations = await summary.json() as { projects: number; recentJobs: Array<{ projectId: string }> };
  expect(operations.projects).toBe(1);
  expect(operations.recentJobs.every((job) => job.projectId === scope.alpha.id)).toBe(true);
  const overview = await request(sut, "viewer", "GET", "/api/v1/system/overview");
  expect(overview.status()).toBe(200);
  const body = await overview.json() as { operations: { projects: number }; components: { worker: { lastJobId?: string | null; processedJobsCount?: number | null } } };
  expect(body.operations.projects).toBe(1);
  expect(body.components.worker.lastJobId ?? null).toBeNull();
  expect(body.components.worker.processedJobsCount ?? null).toBeNull();
  expect((await request(sut, "viewer", "GET", `/api/v1/projects/${scope.alpha.id}`)).status()).toBe(200);
  expect(new URL(sut.url()).pathname).toBe("/projects");
  await screenshot(sut, info, "viewer-scoped-projects");
});

test("should preserve diagnostic mission metadata when operator writes succeed and viewer mutations are forbidden", async ({ browser }, info) => {
  const scope = fixtures().cases.unchanged;
  const operator = await login(browser, scope.operator);
  const payload = { projectId: scope.alpha.id, name: `pilot-boundary-mission-${Date.now()}`, flightDate: null, boundary: null, waypoints: null, stats: null, parameters: null, camera: null };
  const saved = await request(operator, "operator", "POST", "/api/v1/drone-mission", payload);
  expect(saved.status()).toBe(201);
  const mission = await saved.json() as { id: string; projectId: string; name: string; status: string };
  expect(mission.projectId).toBe(scope.alpha.id);
  expect(mission.name).toBe(payload.name);
  expect((await request(operator, "operator", "GET", `/api/v1/drone-mission/${mission.id}`)).status()).toBe(200);
  expect((await request(operator, "operator", "GET", `/api/v1/drone-mission?projectId=${scope.beta.id}`)).status()).toBe(404);
  expect((await request(operator, "operator", "GET", `/api/v1/organizations/${scope.organizationId}/memberships`)).status()).toBe(403);
  const sut = await login(browser, scope.viewer);
  await showProject(sut, scope.alpha);
  const list = await request(sut, "viewer", "GET", `/api/v1/drone-mission?projectId=${scope.alpha.id}`);
  expect(list.status()).toBe(200);
  const before = await list.json() as Array<{ id: string }>;
  expect(before.some((item) => item.id === mission.id)).toBe(true);
  expect((await request(sut, "viewer", "PATCH", `/api/v1/drone-mission/${mission.id}/status`, { status: "CANCELLED" })).status()).toBe(403);
  expect((await request(sut, "viewer", "POST", "/api/v1/drone-mission", payload)).status()).toBe(403);
  expect((await request(sut, "viewer", "GET", `/api/v1/drone-mission/${mission.id}/export?format=kml`)).status()).toBe(403);
  const persisted = await request(sut, "viewer", "GET", `/api/v1/drone-mission/${mission.id}`);
  expect(persisted.status()).toBe(200);
  expect((await persisted.json() as { status: string }).status).toBe(mission.status);
  const capturesBefore = await request(sut, "viewer", "GET", `/api/v1/projects/${scope.alpha.id}/capture-sessions`);
  expect(capturesBefore.status()).toBe(200);
  const captureIds = (await capturesBefore.json() as Array<{ id: string }>).map((item) => item.id);
  expect((await request(sut, "viewer", "POST", `/api/v1/projects/${scope.alpha.id}/capture-sessions`, { captureDate: "2026-11-05", operatorName: "pilot-boundary-forbidden-viewer", captureSource: "DRONE" })).status()).toBe(403);
  const capturesAfter = await request(sut, "viewer", "GET", `/api/v1/projects/${scope.alpha.id}/capture-sessions`);
  expect(capturesAfter.status()).toBe(200);
  expect((await capturesAfter.json() as Array<{ id: string }>).map((item) => item.id)).toEqual(captureIds);
  const after = await request(sut, "viewer", "GET", `/api/v1/drone-mission?projectId=${scope.alpha.id}`);
  expect((await after.json() as unknown[]).length).toBe(before.length);
  expect(new URL(sut.url()).pathname).not.toBe("/login");
  await screenshot(sut, info, "viewer-permitted-project-after-denials");
});

test("should preserve inherent project operation when organization administrator has no explicit assignment", async ({ browser }, info) => {
  const scope = fixtures().cases.unchanged;
  const sut = await login(browser, scope.administrator);
  expect(new Set((await projects(sut, "organization-admin")).map((p) => p.id))).toEqual(new Set([scope.alpha.id, scope.beta.id]));
  const members = await request(sut, "organization-admin", "GET", `/api/v1/organizations/${scope.organizationId}/memberships`);
  expect(members.status()).toBe(200);
  const foreign = fixtures().cases.membership.organizationId;
  expect((await request(sut, "organization-admin", "GET", `/api/v1/organizations/${foreign}/memberships`)).status()).toBe(404);
  const before = await request(sut, "organization-admin", "GET", `/api/v1/projects/${scope.beta.id}/capture-sessions`);
  expect(before.status()).toBe(200);
  const preserved = await before.json() as Array<{ id: string }>;
  await showProject(sut, scope.beta);
  await createCapture(sut, scope.beta.id, "pilot-boundary-inherent-admin");
  const after = await request(sut, "organization-admin", "GET", `/api/v1/projects/${scope.beta.id}/capture-sessions`);
  expect(after.status()).toBe(200);
  const captures = await after.json() as Array<{ id: string; operatorName: string }>;
  expect(captures.length).toBe(preserved.length + 1);
  expect(captures.map((item) => item.id)).toEqual(expect.arrayContaining(preserved.map((item) => item.id)));
  expect(captures.some((item) => item.operatorName === "pilot-boundary-inherent-admin")).toBe(true);
  await screenshot(sut, info, "organization-admin-inherent-project");
});

test("should separate platform governance from customer data when a platform identity signs in", async ({ browser }, info) => {
  const scope = fixtures().cases.activation;
  const sut = await login(browser, scope.administrator);
  expect(new URL(sut.url()).pathname).toBe("/admin");
  expect(await projects(sut, "platform")).toEqual([]);
  const users = await request(sut, "platform", "GET", "/api/v1/admin/users");
  expect(users.status()).toBe(200);
  const platformAccounts = await users.json() as Array<{ id: string; roles: string[] }>;
  expect(platformAccounts.some((user) => user.id === scope.administrator.id)).toBe(true);
  expect(platformAccounts.every((user) => user.roles.includes("ADMIN"))).toBe(true);
  await expect(sut.getByRole("heading", { name: "Administração", exact: true })).toBeVisible();
  await expect(sut.getByText(scope.administrator.email, { exact: true }).first()).toBeVisible();
  expect((await request(sut, "platform", "GET", `/api/v1/projects/${scope.alpha.id}`)).status()).toBe(404);
  expect((await request(sut, "platform", "GET", `/api/v1/organizations/${scope.organizationId}/memberships`)).status()).toBe(404);
  const overview = await request(sut, "platform", "GET", "/api/v1/system/overview");
  expect(overview.status()).toBe(200);
  const body = await overview.json() as { operations: { projects: number; captureSessions: number; jobs: number; recentJobs: unknown[] }; components: { worker: { lastJobId?: string | null } } };
  expect(body.operations).toMatchObject({ projects: 0, captureSessions: 0, jobs: 0, recentJobs: [] });
  expect(body.components.worker.lastJobId ?? null).toBeNull();
  expect((await request(sut, "platform", "GET", "/api/v1/admin/users")).status()).toBe(200);
  await screenshot(sut, info, "platform-governance-without-customer-data");
});

test("should retain authenticated empty scope without demo data when an identity has no organization", async ({ browser }, info) => {
  const scope = fixtures().cases.reassignment;
  const sut = await login(browser, scope.unlinked);
  await sut.goto("/projects");
  expect(await projects(sut, "tenantless")).toEqual([]);
  await expect(sut.getByText("Nenhuma obra encontrada", { exact: true })).toBeVisible();
  expect((await request(sut, "tenantless", "GET", `/api/v1/projects/${scope.alpha.id}`)).status()).toBe(404);
  expect((await request(sut, "tenantless", "GET", "/api/v1/admin/users")).status()).toBe(403);
  await expect(sut.getByText("Obra Integração", { exact: true })).toHaveCount(0);
  await expect(sut.getByText(scope.alpha.name, { exact: true })).toHaveCount(0);
  expect(new URL(sut.url()).pathname).toBe("/projects");
  await screenshot(sut, info, "tenantless-empty-scope");
});

test("should withdraw protected content in both tabs when supported UI logout clears shared auth storage", async ({ browser }, info) => {
  const scope = fixtures().cases.unchanged;
  const sut = await login(browser, scope.viewer);
  await showProject(sut, scope.alpha);
  const second = await sut.context().newPage();
  await second.goto(`/projects/${scope.alpha.id}`);
  await expect(second.getByRole("heading", { name: scope.alpha.name, exact: true }).first()).toBeVisible();
  await second.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(second).toHaveURL(/\/login(?:[/?#]|$)/);
  await expect(sut).toHaveURL(/\/login(?:[/?#]|$)/);
  await expect(sut.getByRole("heading", { name: scope.alpha.name, exact: true })).toHaveCount(0);
  expect((await request(sut, "logged-out-viewer", "GET", `/api/v1/projects/${scope.alpha.id}`)).status()).toBe(401);
  await info.attach("logout-ui-state", { body: Buffer.from(JSON.stringify({ firstPage: new URL(sut.url()).pathname, secondPage: new URL(second.url()).pathname, protectedHeadingVisible: false })), contentType: "application/json" });
});
