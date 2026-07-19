import { expect, test } from "@playwright/test";

test.describe("Proxa smoke tests", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Trade on live match outcomes");
    await expect(page.locator("#main-content").getByRole("link", { name: /explore markets/i })).toBeVisible();
  });

  test("markets page loads", async ({ page }) => {
    await page.goto("/markets");
    await expect(page.getByRole("heading", { name: /markets/i })).toBeVisible();
  });

  test("governance page loads", async ({ page }) => {
    await page.goto("/governance");
    await expect(page.getByRole("heading", { name: /governance/i })).toBeVisible();
  });

  test("skip link is focusable", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to main content/i });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute("href", "#main-content");
  });

  test("terms and privacy pages load", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /terms of service/i })).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /privacy policy/i })).toBeVisible();
  });
});
