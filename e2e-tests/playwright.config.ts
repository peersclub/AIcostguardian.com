import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Use a test-specific environment file
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    cwd: path.resolve(__dirname, '..'), // Run the command from the project root
    timeout: 120 * 1000, // Give the server plenty of time to start
  },
});