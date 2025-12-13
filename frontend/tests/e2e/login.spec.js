import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.click('button[type="submit"]');
    // Add assertions for validation errors
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Fill in login form
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "password123");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL("**/admin/dashboard");

    // Verify dashboard is loaded
    await expect(page.locator("h1")).toContainText("Admin Dashboard");
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Wait for error toast
    await expect(page.locator(".toast")).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.click("text=Register");
    await page.waitForURL("**/register");
    await expect(page.locator("h1")).toContainText("Register");
  });
});
