import { test, expect, Page } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should allow guest access to dashboard without login", async ({ page }) => {
    await page.goto("/dashboard");
    // Should NOT redirect to login due to Guest Mode
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("login page should have sign-in button", async ({ page }) => {
    await page.goto("/login");
    const signInButton = page.getByRole("button", { name: /sign in with google/i });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
  });

  test("login page should have correct metadata", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/CarbonTwin AI/);
  });

  test("login page should be accessible", async ({ page }) => {
    await page.goto("/login");
    // Check for key accessibility attributes
    const signInButton = page.getByRole("button", { name: /sign in with google/i });
    await expect(signInButton).toHaveAttribute("aria-label");

    // Navigation should have no focus traps
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });
});

test.describe("Home Page", () => {
  test("should display hero content", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/See Your/)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Digital Carbon Twin/i })).toBeVisible();
  });

  test("should show feature cards", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Future Impact/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /AI Action Prioritizer/i })).toBeVisible();
  });
});
