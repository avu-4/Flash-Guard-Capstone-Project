import { defineConfig, devices } from '@playwright/test';
 
import 'dotenv/config';
 
/**
* Read environment variables from a .env file.
* https://github.com/motdotla/dotenv
*/
 
/**
* Playwright Test configuration for the Flash-Guard Capstone Project.
* https://playwright.dev/docs/test-configuration
*/
 
export default defineConfig({
  testDir: './tests',
 
  /* Run tests in files in parallel */
  fullyParallel: true,
 
  /* Fail the build on CI if test.only is left in the source code */
  forbidOnly: !!process.env.CI,
 
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
 
  /* Use one worker on CI */
  workers: process.env.CI ? 1 : undefined,
 
  /* HTML test report */
  reporter: 'html',
 
  /* Shared settings for all projects */
  use: {
    /* Base URL for relative navigation */
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
 
    /* Collect trace when retrying a failed test */
    trace: 'on-first-retry',
  },
 
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
 
    /*{
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
 
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
 
    /* Test against mobile viewports */
 
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
 
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
 
    /* Test against branded browsers */
 
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
 
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
 
  /* Run the local development server before starting tests */
  // Uncomment and configure this section if your project needs
  // Playwright to start the application automatically.
 
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
