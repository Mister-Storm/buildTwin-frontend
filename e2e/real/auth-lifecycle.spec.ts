import { test, expect, login, authorized, showProject, activeBeforeChange, openCapture, submitCapture, createCapture } from "./fixtures";
import { resolveRealBrowserEnvironment } from "./environment";
import { resolveLifecycleFixtures } from "./lifecycle-data";

const environment = resolveRealBrowserEnvironment(process.env);
const fixture = () => resolveLifecycleFixtures(process.env);

test.setTimeout(150_000);

test.afterEach(async ({ browser }) => {
  for (const context of browser.contexts()) await context.close();
});

test.beforeEach(async ({ request }) => {
  for (const origin of [environment.baseURL, environment.apiURL]) {
    const response = await request.get(`${origin}/api/v1/projects`, { maxRedirects: 0 });
    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");
  }
});

test("should perform protected UI operations when a new identity receives scoped linkage", async ({ browser }) => {
  const scenario = fixture().cases.linked;
  const administrator = await login(browser, scenario.administrator);
  expect((await authorized(administrator, "POST", `/api/v1/organizations/${scenario.organizationId}/memberships`, { userId: scenario.subject.id, role: "MEMBER" })).status()).toBe(201);
  expect((await authorized(administrator, "POST", `/api/v1/projects/${scenario.alpha.id}/assignments`, { userId: scenario.subject.id, role: "PROJECT_OPERATOR" })).status()).toBe(201);
  const sut = await login(browser, scenario.subject);
  await showProject(sut, scenario.alpha);
  await createCapture(sut, scenario.alpha.id, "pilot-browser-new-link");
});

test("should retain viewer session through refresh and forbidden mutation when scoped role is reduced", async ({ browser }) => {
  const scenario = fixture().cases.downgrade;
  const administrator = await login(browser, scenario.administrator);
  const old = await login(browser, scenario.subject);
  await showProject(old, scenario.alpha);
  await activeBeforeChange(old);
  expect((await authorized(administrator, "POST", `/api/v1/projects/${scenario.alpha.id}/assignments`, { userId: scenario.subject.id, role: "PROJECT_VIEWER" })).status()).toBe(201);
  expect((await old.request.get(`/api/v1/projects/${scenario.alpha.id}`)).status()).toBe(401);
  const sut = await login(browser, scenario.subject);
  await showProject(sut, scenario.alpha);
  const before = await sut.request.get(`/api/v1/projects/${scenario.alpha.id}/capture-sessions`);
  expect(before.status()).toBe(200);
  const count = (await before.json() as unknown[]).length;
  await expect.poll(async () => (await sut.request.get(`/api/v1/projects/${scenario.alpha.id}`)).status(), { timeout: 75_000 }).toBe(401);
  await openCapture(sut, "pilot-browser-forbidden-viewer");
  const refreshed = sut.waitForResponse((value) => value.url().endsWith("/api/v1/auth/refresh") && value.request().method() === "POST");
  expect((await submitCapture(sut, scenario.alpha.id)).status()).toBe(401);
  expect((await refreshed).status()).toBe(200);
  await expect(sut.getByText("Sessão renovada. Envie a operação novamente.", { exact: true })).toBeVisible();
  expect((await submitCapture(sut, scenario.alpha.id)).status()).toBe(403);
  expect((await sut.request.get(`/api/v1/projects/${scenario.alpha.id}`)).status()).toBe(200);
  const after = await sut.request.get(`/api/v1/projects/${scenario.alpha.id}/capture-sessions`);
  expect(after.status()).toBe(200);
  expect((await after.json() as unknown[]).length).toBe(count);
  expect(new URL(sut.url()).pathname).not.toBe("/login");
});

test("should use remaining organization when another membership is revoked", async ({ browser }) => {
  const scenario = fixture().cases.membership;
  const administrator = await login(browser, scenario.administrator);
  const old = await login(browser, scenario.subject);
  await showProject(old, scenario.alpha);
  await activeBeforeChange(old);
  expect((await authorized(administrator, "DELETE", `/api/v1/organizations/${scenario.organizationId}/memberships/${scenario.subject.id}`)).status()).toBe(204);
  expect((await old.request.get(`/api/v1/projects/${scenario.alpha.id}`)).status()).toBe(401);
  const sut = await login(browser, scenario.subject);
  await showProject(sut, scenario.gamma);
  expect((await sut.request.get(`/api/v1/projects/${scenario.alpha.id}`)).status()).toBe(404);
});

test("should preserve reassigned operation when prior project access is removed", async ({ browser }) => {
  const scenario = fixture().cases.reassignment;
  const administrator = await login(browser, scenario.administrator);
  const old = await login(browser, scenario.subject);
  await showProject(old, scenario.alpha);
  await activeBeforeChange(old);
  expect((await authorized(administrator, "DELETE", `/api/v1/projects/${scenario.alpha.id}/assignments/${scenario.subject.id}`)).status()).toBe(204);
  expect((await authorized(administrator, "POST", `/api/v1/projects/${scenario.beta.id}/assignments`, { userId: scenario.subject.id, role: "PROJECT_OPERATOR" })).status()).toBe(201);
  expect((await old.request.get(`/api/v1/projects/${scenario.alpha.id}`)).status()).toBe(401);
  const sut = await login(browser, scenario.subject);
  await showProject(sut, scenario.beta);
  await createCapture(sut, scenario.beta.id, "pilot-browser-reassigned");
  expect((await sut.request.get(`/api/v1/projects/${scenario.alpha.id}`)).status()).toBe(404);
});

test("should keep both old devices revoked when a platform identity is reactivated", async ({ browser }) => {
  const scenario = fixture().cases.activation;
  const administrator = await login(browser, scenario.administrator);
  const first = await login(browser, scenario.subject);
  const second = await login(browser, scenario.subject);
  expect((await first.request.get("/api/v1/admin/users")).status()).toBe(200);
  await activeBeforeChange(first);
  expect((await authorized(administrator, "PATCH", `/api/v1/admin/users/${scenario.subject.id}/toggle-active`)).status()).toBe(200);
  expect((await first.request.get("/api/v1/admin/users")).status()).toBe(401);
  expect((await authorized(administrator, "PATCH", `/api/v1/admin/users/${scenario.subject.id}/toggle-active`)).status()).toBe(200);
  expect((await first.request.get("/api/v1/admin/users")).status()).toBe(401);
  expect((await second.request.get("/api/v1/admin/users")).status()).toBe(401);
  const sut = await login(browser, scenario.subject);
  expect((await sut.request.get("/api/v1/admin/users")).status()).toBe(200);
});

test("should preserve unrelated permitted roles when another identity changes", async ({ browser }) => {
  const scenario = fixture().cases.unchanged;
  const administrator = await login(browser, scenario.administrator);
  const operator = await login(browser, scenario.operator);
  const viewer = await login(browser, scenario.viewer);
  await showProject(operator, scenario.alpha);
  await showProject(viewer, scenario.alpha);
  expect((await authorized(administrator, "POST", `/api/v1/organizations/${scenario.organizationId}/memberships`, { userId: scenario.unlinked.id, role: "MEMBER" })).status()).toBe(201);
  const sut = operator;
  await createCapture(sut, scenario.alpha.id, "pilot-browser-unaffected-operator");
  expect((await viewer.request.get(`/api/v1/projects/${scenario.alpha.id}`)).status()).toBe(200);
  await showProject(administrator, scenario.beta);
  await createCapture(administrator, scenario.beta.id, "pilot-browser-inherent-admin");
});
