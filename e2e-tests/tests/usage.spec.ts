import { test, expect } from '@playwright/test';
import { login } from './helpers';

// This is a simplified helper, in a real app you would have a more robust way to add keys
async function addApiKey(page: Page, provider: string, key: string) {
  await page.goto('/settings');
  await page.route('/api/keys/validate', route => {
    route.fulfill({ status: 200, json: { isValid: true } });
  });
  await page.getByLabel('Provider').selectOption(provider);
  await page.getByLabel('API Key').fill(key);
  await page.getByRole('button', { name: 'Save Key' }).click();
  await page.waitForNavigation(); // Or some other wait condition
}

test.describe('Core Functionality - Usage & Cost Tracking', () => {
  test('Test 3.1: Track a Successful API Call and Verify Cost', async ({ page }) => {
    const provider = 'openai';
    const model = 'gpt-3.5-turbo';
    const promptTokens = 50;
    const completionTokens = 100;
    const totalTokens = promptTokens + completionTokens;
    const expectedCost = (promptTokens / 1000) * 0.0005 + (completionTokens / 1000) * 0.0015;

    await login(page);
    await addApiKey(page, provider, 'sk-test-key');

    // Mock the AI API call
    await page.route(`https://api.openai.com/v1/chat/completions`, route => {
      route.fulfill({
        status: 200,
        json: {
          id: 'chatcmpl-test123',
          object: 'chat.completion',
          created: Date.now(),
          model: model,
          choices: [{ index: 0, message: { role: 'assistant', content: 'This is a mocked response.' }, finish_reason: 'stop' }],
          usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: totalTokens },
        },
      });
    });

    // Navigate to a chat page (assuming one exists at /chat)
    await page.goto('/chat');

    // Perform an action that triggers the API call
    await page.getByPlaceholder('Type your message...').fill('Hello, world!');
    await page.getByRole('button', { name: 'Send' }).click();

    // Assert that the UI shows the mocked response
    await expect(page.locator('text=This is a mocked response.')).toBeVisible();

    // Navigate to the dashboard to verify usage
    await page.goto('/dashboard');

    // Assert that the dashboard reflects the new usage
    // Note: These locators are assumptions. You would need to inspect your app to get the correct ones.
    const totalCostLocator = page.locator('[data-testid=total-cost]');
    const totalTokensLocator = page.locator('[data-testid=total-tokens]');
    
    await expect(totalCostLocator).toHaveText(`$${expectedCost.toFixed(6)}`);
    await expect(totalTokensLocator).toHaveText(totalTokens.toString());

    // Assert that the recent usage table is updated
    const recentUsageRow = page.locator('table >> tr', { hasText: model });
    await expect(recentUsageRow).toBeVisible();
    await expect(recentUsageRow.locator('td', { hasText: totalTokens.toString() })).toBeVisible();
    await expect(recentUsageRow.locator('td', { hasText: `$${expectedCost.toFixed(6)}` })).toBeVisible();
  });
});
