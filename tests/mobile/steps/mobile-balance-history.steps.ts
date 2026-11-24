
import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'node:assert';
import type { MobileWorld } from '../support/world';
import { getBalance } from '../../ui/testData/db';

// --------------------------------------------------
// TEST STATE
// --------------------------------------------------

let transactionCountBeforeScroll = 0;

// --------------------------------------------------
// NAVIGATION HELPERS
// --------------------------------------------------

async function tapBottomNavigation(
  driver: MobileWorld['driver'],
  label: string
) {
  const item = await driver.$(
    `android=new UiSelector().descriptionContains("${label}")`
  );

  await item.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: `${label} navigation option was not found`,
  });

  await item.click();
}

async function openDashboard(driver: MobileWorld['driver']) {
  await tapBottomNavigation(driver, 'Dashboard');

  await driver.waitUntil(
    async () => {
      const source = await driver.getPageSource();
      return source.includes('TOTAL NET WORTH');
    },
    {
      timeout: 15000,
      timeoutMsg: 'Dashboard screen was not displayed',
    }
  );
}

async function openHistory(driver: MobileWorld['driver']) {
  await tapBottomNavigation(driver, 'History');

  await driver.waitUntil(
    async () => {
      const source = await driver.getPageSource();
      return source.includes('Total Spending (May)');
    },
    {
      timeout: 15000,
      timeoutMsg: 'History screen was not displayed',
    }
  );
}

// --------------------------------------------------
// TRANSACTION STATUS HELPER
// --------------------------------------------------

// Extract uppercase transaction statuses from Android XML.
// This excludes title-case filter button labels.
function getDisplayedTransactionStatuses(source: string): string[] {
  const matches = source.match(
    /text="(PENDING|COMPLETED|REJECTED)"/g
  ) || [];

  return matches.map(match =>
    match.match(/text="([^"]+)"/)![1].toLowerCase()
  );
}

// --------------------------------------------------
// HISTORY FILTER HELPER
// --------------------------------------------------

async function selectHistoryFilter(
  driver: MobileWorld['driver'],
  filter: 'Pending' | 'Completed'
) {
  const expectedStatus = filter.toLowerCase();

  console.log(`\nSelecting ${filter} filter...`);

  const filterButton = await driver.$(
    `android=new UiSelector().text("${filter}")`
  );

  await filterButton.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: `${filter} filter was not displayed`,
  });

  console.log(`${filter} filter button displayed: true`);

  await filterButton.click();

  // Wait until the displayed transaction statuses match the selected filter.
  await driver.waitUntil(
    async () => {
      const source = await driver.getPageSource();
      const statuses = getDisplayedTransactionStatuses(source);

      return (
        statuses.length > 0 &&
        statuses.every(status => status === expectedStatus)
      );
    },
    {
      timeout: 10000,
      timeoutMsg: `${filter} transactions were not displayed after selecting the filter`,
    }
  );

  const finalSource = await driver.getPageSource();
  const finalStatuses = getDisplayedTransactionStatuses(finalSource);

  console.log(
    `\n========== ${filter.toUpperCase()} FILTER RESULT ==========`
  );
  console.log('Displayed statuses:', finalStatuses);
  console.log('====================================================\n');
}

// --------------------------------------------------
// SCENARIO 1: ACCOUNT BALANCE
// --------------------------------------------------

When(
  'I open the Dashboard',
  async function (this: MobileWorld) {
    await openDashboard(this.driver);
  }
);

Then(
  'my current account balance should be displayed',
  async function (this: MobileWorld) {
    const source = await this.driver.getPageSource();

    assert.ok(
      source.includes('TOTAL NET WORTH'),
      'Total Net Worth section was not displayed'
    );

    assert.match(
      source,
      /R\s*[\d,]+\.\d{2}/,
      'A formatted account balance was not displayed'
    );
  }
);

Then(
  'the displayed balance should match the account balance in the database',
  async function (this: MobileWorld) {
    const databaseBalance = await getBalance('Alice Ledger');
    const source = await this.driver.getPageSource();

    const balanceMatch = source.match(
      /R\s*([\d,]+\.\d{2})/
    );

    assert.ok(
      balanceMatch,
      'Could not find the displayed account balance'
    );

    const displayedBalance = Number(
      balanceMatch[1].replace(/,/g, '')
    );

    assert.equal(
      displayedBalance,
      Number(databaseBalance),
      `Mobile balance (${displayedBalance}) does not match database balance (${databaseBalance})`
    );
  }
);

// --------------------------------------------------
// SCENARIO 2: TRANSACTION HISTORY
// --------------------------------------------------

Given(
  'I am on the History screen',
  async function (this: MobileWorld) {
    await openHistory(this.driver);
  }
);

When(
  'I scroll to the bottom of the transaction list',
  async function (this: MobileWorld) {
    const source = await this.driver.getPageSource();

    transactionCountBeforeScroll = (
      source.match(/Transfer #\d+/g) || []
    ).length;

    const size = await this.driver.getWindowSize();

    await this.driver.execute('mobile: scrollGesture', {
      left: 0,
      top: Math.floor(size.height * 0.25),
      width: size.width,
      height: Math.floor(size.height * 0.6),
      direction: 'down',
      percent: 0.8,
    });

    await this.driver.pause(1500);
  }
);

Then(
  'additional transactions should be loaded',
  async function (this: MobileWorld) {
    const source = await this.driver.getPageSource();

    const transactionCountAfterScroll = (
      source.match(/Transfer #\d+/g) || []
    ).length;

    assert.ok(
      transactionCountAfterScroll > transactionCountBeforeScroll,
      `No additional transactions were loaded. Before: ${transactionCountBeforeScroll}, after: ${transactionCountAfterScroll}`
    );
  }
);

// --------------------------------------------------
// SCENARIO 3: FILTER TRANSACTION HISTORY
// --------------------------------------------------

When(
  'I select the Pending filter',
  async function (this: MobileWorld) {
    await selectHistoryFilter(this.driver, 'Pending');
  }
);

Then(
  'only pending transactions should be displayed',
  async function (this: MobileWorld) {
    const source = await this.driver.getPageSource();
    const statuses = getDisplayedTransactionStatuses(source);

    console.log('\n========== PENDING FILTER ASSERTION ==========');
    console.log('Displayed statuses:', statuses);
    console.log('===============================================\n');

    assert.ok(
      statuses.length > 0,
      'No pending transaction statuses were found'
    );

    assert.ok(
      statuses.every(status => status === 'pending'),
      `Unexpected transaction statuses were displayed: ${statuses.join(', ')}`
    );
  }
);

When(
  'I select the Completed filter',
  async function (this: MobileWorld) {
    await selectHistoryFilter(this.driver, 'Completed');
  }
);

Then(
  'only completed transactions should be displayed',
  async function (this: MobileWorld) {
    const source = await this.driver.getPageSource();
    const statuses = getDisplayedTransactionStatuses(source);

    console.log('\n========== COMPLETED FILTER ASSERTION ==========');
    console.log('Displayed statuses:', statuses);
    console.log('================================================\n');

    assert.ok(
      statuses.length > 0,
      'No completed transaction statuses were found'
    );

    assert.ok(
      statuses.every(status => status === 'completed'),
      `Unexpected transaction statuses were displayed: ${statuses.join(', ')}`
    );
  }
);

// --------------------------------------------------
// SCENARIO 4: SCREENSHOT SHARING
// --------------------------------------------------

When(
  'I select the option to export or share a transaction screenshot',
  async function (this: MobileWorld) {
    const selectors = [
      '~Share',
      '~Export',
      '~Share Screenshot',
      '~Export Screenshot',
      'android=new UiSelector().textContains("Share")',
      'android=new UiSelector().textContains("Export")',
    ];

    let actionFound = false;

    for (const selector of selectors) {
      const action = await this.driver.$(selector);

      try {
        if (await action.isDisplayed()) {
          await action.click();
          actionFound = true;
          break;
        }
      } catch {
        // Continue checking the available selectors.
      }
    }

    assert.ok(
      actionFound,
      'No screenshot export or sharing option is available'
    );
  }
);

Then(
  'the transaction screenshot should be available for sharing',
  async function (this: MobileWorld) {
    const source = await this.driver.getPageSource();

    assert.ok(
      source.includes('Sharing') ||
        source.includes('Share') ||
        source.includes('Save image'),
      'Screenshot sharing or export was not made available'
    );
  }
);
