import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Testing
 * 
 * IMPORTANT: This file is for E2E (End-to-End) testing only.
 * 
 * Performance/Load Testing is done separately using K6:
 * - K6 scripts location: load-tests/k6-scripts/*.js
 * - Run all K6 tests: npm run load-test:all
 * - Run quick K6 tests: npm run load-test:quick
 * 
 * BASE URLs Configuration:
 * - E2E Testing (Playwright): https://www.saucedemo.com
 * - Load Testing (K6): https://jsonplaceholder.typicode.com
 *   (See load-tests/k6-scripts/*.js - BASE_URL constant in each file)
 * 
 * See load-tests/README.md for detailed K6 load testing documentation.
 */

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'reports/html-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* 
     * Base URL for E2E Testing (Playwright)
     * 
     * Reference: This is the base URL used by all Playwright E2E tests.
     * Load tests (K6) use a different base URL - see BASE_URL constant
     * in load-tests/k6-scripts/*.js files (https://jsonplaceholder.typicode.com)
     */
    baseURL: 'https://www.saucedemo.com',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on failure */
    video: 'retain-on-failure',
    /* Headless mode - can be overridden via CLI flag */
    headless: process.env.HEADLESS !== 'false',
    /* Increase navigation timeout */
    navigationTimeout: 60000,
    /* Increase action timeout */
    actionTimeout: 30000,
  },

  /* Global test timeout */
  timeout: 60000,

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

