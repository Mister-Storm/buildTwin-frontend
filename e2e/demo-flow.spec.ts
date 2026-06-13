import { expect, test } from "@playwright/test";
import {
  DEMO_FLIGHT_ID,
  DEMO_PROJECT_ID,
} from "../src/features/demo/demo-seed";

test.describe("Investor demo flow", () => {
  test("navigates dashboard → projects → detail → orthomosaic", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "See Your Construction Site Evolve" }),
    ).toBeVisible();
    await expect(page.getByText("Visão Executiva")).toBeVisible();

    await page.getByRole("link", { name: "Ver Obras" }).click();
    await expect(page).toHaveURL("/projects");
    await expect(page.getByRole("heading", { name: "Projetos" })).toBeVisible();

    await page.getByRole("link", { name: /Riverside Tower/i }).click();
    await expect(page).toHaveURL(
      `/projects/${DEMO_PROJECT_ID}`,
    );
    await expect(
      page.getByRole("heading", { name: "Evolução Temporal" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "View Orthomosaic" }).click();
    await expect(page).toHaveURL(
      `/projects/${DEMO_PROJECT_ID}/orthomosaic?flightId=${DEMO_FLIGHT_ID}`,
    );

    await expect(
      page.getByRole("img", { name: /Ortomosaico da obra Riverside Tower/i }),
    ).toBeVisible();
    await expect(
      page.getByText("Detalhes do Ortomosaico"),
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
