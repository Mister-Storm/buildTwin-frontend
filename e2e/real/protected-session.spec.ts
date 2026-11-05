import { test, expect } from "./fixtures";

test("should retain permitted project access when a scoped user signs in", async ({ authenticatedPage }) => {
  const sut = authenticatedPage;
  const response = await sut.request.get("/api/v1/projects");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
});
