import { expect, test } from "@playwright/test";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const FLIGHT_ID = "22222222-2222-4222-8222-222222222222";

test.describe("Real API integration flow", () => {
  test("navigates dashboard → projects → detail → orthomosaic with API data", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "See Your Construction Site Evolve" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Demo Comercial" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Projetos" }).click();
    await expect(page).toHaveURL("/projects");
    await expect(
      page.getByRole("link", { name: /Obra Integração/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /Obra Integração/i }).click();
    await expect(page).toHaveURL(`/projects/${PROJECT_ID}`);
    await expect(
      page.getByRole("heading", { name: "Evolução Temporal" }),
    ).toBeVisible();
    await expect(
      page
        .locator("section")
        .filter({
          has: page.getByRole("heading", { name: "Evolução Temporal" }),
        })
        .getByText("Operador E2E")
        .first(),
    ).toBeVisible();

    await page.getByRole("link", { name: "Ver Ortomosaico" }).click();
    await expect(page).toHaveURL(
      `/projects/${PROJECT_ID}/orthomosaic?flightId=${FLIGHT_ID}`,
    );

    await expect(
      page.getByRole("img", { name: /Ortomosaico da obra Obra Integração/i }),
    ).toBeVisible();
    await expect(page.getByText("Detalhes do Ortomosaico")).toBeVisible();
    await expect(page.getByText("Operador E2E").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Baixar ortomosaico/i }),
    ).toBeVisible();
  });
});

test.describe("Theme toggle", () => {
  test("switches between light and dark themes", async ({ page }) => {
    await page.goto("/");

    const darkButton = page.getByRole("button", { name: "Dark" });
    await darkButton.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    const lightButton = page.getByRole("button", { name: "Light" });
    await lightButton.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});
