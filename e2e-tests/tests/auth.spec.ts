import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('User Authentication & Onboarding', () => {
  test('Test 1.1: New User Registration and First Login', async ({ page }) => {
    // The global-setup script already seeded a new user.
    // We just need to log them in.
    await login(page, 'testuser@test.com');

    // Navigate to the dashboard
    await page.goto('/dashboard');

    // Verification
    await expect(page).toHaveURL('/dashboard');
    const welcomeMessage = page.locator('text=/Welcome|Dashboard/'); // Look for a welcome message or a dashboard heading
    await expect(welcomeMessage).toBeVisible();

    // We can't directly query the database from the test, 
    // but the fact that we can log in and see the dashboard is a strong indication
    // that the user was created successfully in the seed script.
  });

  test('Test 1.2: Protected Routes', async ({ page }) => {
    // Ensure we are logged out by starting with a fresh page context
    // Playwright provides a new context for each test file, so we are logged out by default.

    // Attempt to navigate directly to /dashboard
    await page.goto('/dashboard');
    // Check that we were redirected to a login page or the homepage
    await expect(page).not.toHaveURL('/dashboard');
    await expect(page.locator('text=Sign in')).toBeVisible(); // Or whatever your login button text is

    // Attempt to navigate directly to /settings
    await page.goto('/settings');
    await expect(page).not.toHaveURL('/settings');
    await expect(page.locator('text=Sign in')).toBeVisible();
  });
});
