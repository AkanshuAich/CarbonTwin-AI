import { test, expect, Page } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should show login page when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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
    await expect(page.getByText(/Digital Carbon Twin/i)).toBeVisible();
  });

  test("should show feature cards", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/Future Impact/i)).toBeVisible();
    await expect(page.getByText(/AI Action Prioritizer/i)).toBeVisible();
  });
});
