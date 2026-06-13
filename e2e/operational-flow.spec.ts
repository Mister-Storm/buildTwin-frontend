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
    await expect(page.getByText("Ambiente")).toBeVisible();
    await expect(page.getByText("PostgreSQL")).toBeVisible();
    await expect(page.getByText("Processor")).toBeVisible();
    await expect(page.getByText("Checklist de Demonstração")).toBeVisible();
    await expect(page.getByText("Backend")).toBeVisible();
    await expect(page.getByText("Estatísticas Operacionais")).toBeVisible();
    await expect(page.getByText("Últimos Processamentos")).toBeVisible();
  });

  test("demo self-test button runs checks", async ({ page }) => {
    await page.goto("/demo");
    await page.getByRole("button", { name: "Executar Self-Test" }).click();
    await expect(page.getByText("Resultado: Sucesso")).toBeVisible();
    await expect(page.getByText("postgres")).toBeVisible();
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
