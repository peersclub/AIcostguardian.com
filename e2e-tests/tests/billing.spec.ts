import { test, expect, Page, request } from '@playwright/test';
import { login } from './helpers';

async function addApiKey(page: Page, provider: string, key: string) {
  await page.goto('/settings');
  await page.route('/api/keys/validate', route => {
    route.fulfill({ status: 200, json: { isValid: true } });
  });
  await page.getByLabel('Provider').selectOption(provider);
  await page.getByLabel('API Key').fill(key);
  await page.getByRole('button', { name: 'Save Key' }).click();
  await page.waitForNavigation();
}

test.describe('Subscription & Billing', () => {
  test('Test 4.1: Feature Gating', async ({ page }) => {
    await login(page);
    await addApiKey(page, 'openai', 'sk-first-key');

    // Attempt to add a second key
    await page.goto('/settings');
    const addKeyButton = page.getByRole('button', { name: 'Add API Key' });

    // This is an assumption about how the feature is gated.
    // It could be a disabled button, or a redirect.
    await expect(addKeyButton).toBeDisabled();

    // Alternatively, check for an upgrade prompt
    await expect(page.locator('text=Upgrade to add more keys')).toBeVisible();
  });

  test('Test 4.2: Upgrade Flow', async ({ page }) => {
    const { userId } = await login(page);

    // 1. Navigate to pricing and attempt to upgrade
    await page.goto('/pricing');
    await page.getByRole('button', { name: 'Upgrade to Growth' }).click();

    // 2. Mock the Stripe redirect and simulate a successful payment via the webhook
    // In a real test, you would intercept the navigation to Stripe.
    // Here, we'll just directly call our mock webhook.
    const requestContext = await request.newContext();
    const webhookResponse = await requestContext.post('http://localhost:3000/api/stripe/e2e-webhook', {
      data: { userId },
    });
    expect(webhookResponse.ok()).toBeTruthy();

    // 3. Navigate back to settings and verify the user can add a second key
    await page.goto('/settings');
    await addApiKey(page, 'openai', 'sk-first-key'); // Add the first key

    const addKeyButton = page.getByRole('button', { name: 'Add API Key' });
    await expect(addKeyButton).toBeEnabled(); // The button should now be enabled

    // Add a second key to confirm
    await addApiKey(page, 'claude', 'sk-second-key');
    await expect(page.locator('text=sk-second-key')).toBeVisible();
  });
});
