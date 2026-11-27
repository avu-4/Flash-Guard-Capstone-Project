
/*import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Report & Export', () => {
  test.beforeEach(async ({ page }) => {
    // Open the FlashGuard web application
    await page.goto('http://localhost:3000/history');

    // TODO: Add login steps here if the session is not
    // already authenticated.
    
    // Navigate to the Report & Export page.
    // Adjust this locator to match your actual UI.
    await page.getByText('Report & Export').click();
  });

  test('FG-RE-001: Generate and export transaction report', async ({
    page,
  }) => {
    // Verify that the report page is visible
    await expect(
      page.getByText(/report/i).first()
    ).toBeVisible();

    // Generate the transaction report
    await page.getByRole('button', {
      name: /generate report/i,
    }).click();

    // Verify that the report has been generated.
    // Adjust this assertion to match the actual report UI.
    await expect(
      page.getByText(/transaction/i).first()
    ).toBeVisible();

    // Export the report as CSV
    const csvDownload = page.waitForEvent('download');

    await page.getByRole('button', {
      name: /export csv/i,
    }).click();

    const csvFile = await csvDownload;

    expect(csvFile.suggestedFilename()).toMatch(/\.csv$/i);

    // Export the report as PDF
    const pdfDownload = page.waitForEvent('download');

    await page.getByRole('button', {
      name: /export pdf/i,
    }).click();

    const pdfFile = await pdfDownload;

    expect(pdfFile.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});*/

import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Transaction History', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate directly to Transaction History
    await page.goto('http://localhost:3000/history');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
  });

  test('FG-HIS-001: Filter transaction history by date range', async ({
    page,
  }) => {

    // Verify Transaction History page is displayed
    await expect(
      page.getByText(/transaction history/i).first()
    ).toBeVisible();

    // Locate start and end date fields
    const dateInputs = page.locator('input[type="date"]');

    await expect(dateInputs).toHaveCount(2);

    // Select date range
    await dateInputs.nth(0).fill('2026-10-01');
    await dateInputs.nth(1).fill('2026-10-29');

    // Apply date filter
    await page.getByRole('button', {
      name: /apply|filter|search/i,
    }).click();

    // Verify filtered history is displayed
    await expect(
      page.locator('table')
    ).toBeVisible();
  });

});
