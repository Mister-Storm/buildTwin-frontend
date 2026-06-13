import { expect, test } from "@playwright/test";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const FLIGHT_ID = "22222222-2222-4222-8222-222222222222";

test.describe("Operational workflow UI", () => {
  test("demo page shows environment health and infra checklist", async ({
    page,
  }) => {
    await page.goto("/demo");

    await expect(
      page.getByRole("heading", { name: "Demonstração para Construtoras" }),
    ).toBeVisible();

    const environmentSection = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Ambiente" }) });

    await expect(environmentSection).toBeVisible();
    await expect(
      environmentSection.getByText("PostgreSQL", { exact: true }),
    ).toBeVisible();
    await expect(
      environmentSection.getByText("Processor", { exact: true }),
    ).toBeVisible();

    const checklistCard = page.locator("div.rounded-xl.border").filter({
      has: page.getByRole("heading", { name: "Checklist de Demonstração" }),
    });

    await expect(checklistCard.getByRole("list").getByText("Backend")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Checklist de Demonstração" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Estatísticas Operacionais" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Últimos Processamentos" }),
    ).toBeVisible();
  });

  test("demo self-test button runs checks", async ({ page }) => {
    await page.goto("/demo");
    await page.getByRole("button", { name: "Executar Self-Test" }).click();

    const resultPanel = page
      .locator("div.rounded-lg.border")
      .filter({ hasText: "Resultado: Sucesso" })
      .first();

    await expect(resultPanel).toBeVisible();
    await expect(
      resultPanel.getByText("postgres", { exact: true }),
    ).toBeVisible();
    await expect(
      resultPanel.getByText("minio", { exact: true }),
    ).toBeVisible();
  });

  test("projects page shows Nova Obra and opens flight detail", async ({
    page,
  }) => {
    await page.goto("/projects");

    await expect(page.getByRole("button", { name: "Nova Obra" })).toBeVisible();
    await page.getByRole("link", { name: /Obra Integração/i }).click();
    await expect(page).toHaveURL(`/projects/${PROJECT_ID}`);

    await expect(page.getByRole("button", { name: "Novo Voo" })).toBeVisible();
    await page.getByRole("link", { name: /Operador E2E/i }).first().click();
    await expect(page).toHaveURL(
      `/projects/${PROJECT_ID}/flights/${FLIGHT_ID}`,
    );

    await expect(page.getByText("Upload de Imagens")).toBeVisible();
    await expect(page.getByRole("button", { name: "Processar Voo" })).toBeVisible();
    await expect(page.getByText("Monitoramento")).toBeVisible();
  });
});
