import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('API Key Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/settings');
  });

  test('Test 2.1: Add a Valid API Key', async ({ page }) => {
    // Mock the API route that validates the key
    await page.route('/api/keys/validate', route => {
      route.fulfill({ status: 200, json: { isValid: true } });
    });

    await page.getByLabel('Provider').selectOption('openai');
    await page.getByLabel('API Key').fill('sk-valid-key-for-testing');
    await page.getByRole('button', { name: 'Save Key' }).click();

    await expect(page.locator('text=Key saved successfully')).toBeVisible();
    await expect(page.locator('text=sk-valid-key-for-testing')).toBeVisible();
    await expect(page.locator('text=Valid')).toBeVisible();
  });

  test('Test 2.2: Attempt to Add an Invalid API Key', async ({ page }) => {
    // Mock the API route that validates the key
    await page.route('/api/keys/validate', route => {
      route.fulfill({ status: 400, json: { isValid: false, error: 'Invalid API Key' } });
    });

    await page.getByLabel('Provider').selectOption('openai');
    await page.getByLabel('API Key').fill('invalid-key');
    await page.getByRole('button', { name: 'Save Key' }).click();

    await expect(page.locator('text=Invalid API Key')).toBeVisible();
  });

  test('Test 2.3: Delete an API Key', async ({ page }) => {
    // For this test, we'd ideally use a helper to add a key programmatically.
    // For now, we'll combine the add and delete actions.
    await page.route('/api/keys/validate', route => {
      route.fulfill({ status: 200, json: { isValid: true } });
    });
    await page.getByLabel('Provider').selectOption('openai');
    await page.getByLabel('API Key').fill('sk-to-be-deleted');
    await page.getByRole('button', { name: 'Save Key' }).click();

    await expect(page.locator('text=sk-to-be-deleted')).toBeVisible();

    // Now delete the key
    const keyRow = page.locator('tr', { hasText: 'sk-to-be-deleted' });
    await keyRow.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Confirm Delete' }).click(); // Assuming a confirmation dialog

    await expect(page.locator('text=Key deleted successfully')).toBeVisible();
    await expect(page.locator('text=sk-to-be-deleted')).not.toBeVisible();
  });
});
