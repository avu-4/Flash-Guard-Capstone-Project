import { Given, When, Then } from '@wdio/cucumber-framework';

// Dashboard configuration
const APP_PACKAGE = 'com.anonymous.flashguadmobileapp';
const WAIT = 15000;

const QUICK_ACTIONS = [
    'Buy Airtime',
    'Send Money',
    'Pay Bills'
];

const NAVIGATION_TABS = [
    'Dashboard',
    'Services',
    'Transact',
    'History',
    'Account'
];

let balanceBefore = '';

// Find an element using its exact Android text
const byText = (text: string) =>
    `//android.widget.TextView[@text="${text}"]`;

// Verify that an element is displayed
async function verifyText(text: string) {
    const element = await $(byText(text));

    await element.waitForDisplayed({
        timeout: WAIT,
        timeoutMsg: `${text} is not displayed`
    });

    expect(await element.isDisplayed()).toBe(true);

    console.log(`Verified: ${text}`);
}

// Read the dashboard balance
async function readBalance(): Promise<string> {
    const balance = await $(
        '//android.widget.TextView[@text="TOTAL NET WORTH"]' +
        '/following::android.widget.TextView[1]'
    );

    await balance.waitForDisplayed({
        timeout: WAIT
    });

    const value = (await balance.getText()).trim();

    expect(value).toMatch(
        /^R\s*-?\d[\d\s.,]*[.,]\d{2}$/
    );

    console.log(`Dashboard balance: ${value}`);

    return value;
}

// Launch application and verify login
Given('the user is signed in on the Android device', async () => {

  await driver.updateSettings({ enforceXPath1: true });
await driver.activateApp(APP_PACKAGE);

    const dashboard = await $(byText('TOTAL NET WORTH'));

    const signIn = await $(
        '//*[@clickable="true" and contains(@content-desc,"Sign In")]'
    );

    const okButton = await $(
        '//android.widget.Button[@text="OK"]'
    );

    const dashboardTab = await $(
        '//*[@clickable="true" and contains(@content-desc,", Dashboard")]'
    );

    await driver.waitUntil(async () => {
        return await dashboard.isDisplayed() ||
               await signIn.isDisplayed() ||
               await okButton.isDisplayed() ||
               await dashboardTab.isDisplayed();
    }, {
        timeout: 30000,
        timeoutMsg: 'Login screen or Dashboard not found'
    });

    if (await signIn.isDisplayed()) {
        await signIn.click();

        await okButton.waitForDisplayed({
            timeout: WAIT
        });

        await okButton.click();

    } else if (await okButton.isDisplayed()) {
        await okButton.click();

    } else if (!(await dashboard.isDisplayed()) &&
               await dashboardTab.isDisplayed()) {
        await dashboardTab.click();
    }

    await dashboard.waitForDisplayed({
        timeout: 20000
    });

    console.log('Android Dashboard opened successfully');
});
// =====================================================
// T-MOB-DASH-001: Dashboard layout and balance display
// =====================================================

Then('the dashboard title is displayed', async () => {

    await verifyText('Welcome back,');
    await verifyText('Alice Ledger');

    console.log('Dashboard heading verified');
});

Then('the total net worth is shown in a valid Rand format', async () => {

    await verifyText('TOTAL NET WORTH');

    const balance = await readBalance();

    console.log(`Valid Rand balance: ${balance}`);
});

Then('the pending card is displayed', async () => {

    await verifyText('PENDING APPROVALS');

    const pendingCount = await $(
        '//android.widget.TextView[@text="PENDING APPROVALS"]' +
        '/following::android.widget.TextView[1]'
    );

    await pendingCount.waitForDisplayed({
        timeout: WAIT
    });

    const count = await pendingCount.getText();

    expect(count).toMatch(/^\d+$/);

    console.log(`Pending approvals: ${count}`);
});

Then('the quick actions Buy Airtime, Send Money and Pay Bills are displayed', async () => {

    for (const action of QUICK_ACTIONS) {
        await verifyText(action);
    }

    console.log('All three quick actions verified');
});

Then('the spending summary section is displayed', async () => {

    const heading = await $(
        '(//android.widget.TextView[@text="Spending Summary"])[1]'
    );

    await heading.waitForDisplayed({
        timeout: WAIT
    });

    expect(await heading.isDisplayed()).toBe(true);

    await verifyText('Investments');
    await verifyText('Lifestyle');

    console.log('Spending Summary verified');
});

Then('the bottom navigation tabs are displayed', async () => {

    for (const tab of NAVIGATION_TABS) {
        await verifyText(tab);
    }

    console.log('All five navigation tabs verified');
});

Then('the dashboard fits the screen width without sideways scrolling', async () => {

    const { width } = await driver.getWindowSize();

    for (const action of QUICK_ACTIONS) {

        const element = await $(
            `//*[@clickable="true" and contains(@content-desc,", ${action}")]`
        );

        await element.waitForDisplayed({
            timeout: WAIT
        });

        const location = await element.getLocation();
        const size = await element.getSize();

        expect(location.x).toBeGreaterThanOrEqual(0);

        expect(location.x + size.width)
            .toBeLessThanOrEqual(width);

        console.log(
            `${action}: x=${location.x}, width=${size.width}, screen=${width}`
        );
    }

    console.log('Quick-action layout fits screen width');
});

Then('no broken values such as undefined or NaN are shown', async () => {

    const elements = await $$(
        '//android.widget.TextView'
    );

    for (const element of elements) {

        if (await element.isDisplayed()) {

            const text = await element.getText();

            expect(text).not.toMatch(
                /\b(undefined|NaN|null)\b|\[object Object\]/i
            );
        }
    }

    console.log('No broken visible text values detected');
});
// =====================================================
// T-MOB-DASH-002: Recent transactions and pagination
// =====================================================

async function scrollDashboardDown(): Promise<boolean> {

    const { width, height } = await driver.getWindowSize();

    return await driver.execute('mobile: scrollGesture', {
        left: Math.round(width * 0.1),
        top: Math.round(height * 0.2),
        width: Math.round(width * 0.8),
        height: Math.round(height * 0.6),
        direction: 'down',
        percent: 0.8
    }) as boolean;
}

When('the user scrolls down to the Recent Transactions section', async () => {

    await scrollDashboardDown();

    await verifyText('Recent Transactions');

    console.log('Recent Transactions section reached');
});

Then('at least one transaction is visible', async () => {
    const heading = await $(byText('Recent Transactions'));
    await heading.waitForDisplayed({ timeout: WAIT });

    const headingLocation = await heading.getLocation();
    const elements = await $$('//android.widget.TextView');

    const visibleAmounts: string[] = [];

    for (const element of elements) {
        if (!(await element.isDisplayed())) continue;

        const text = (await element.getText()).trim();
        const location = await element.getLocation();

        if (
            location.y > headingLocation.y &&
            /^R\s*-?\d[\d\s.,]*[.,]\d{2}$/.test(text)
        ) {
            visibleAmounts.push(text);
        }
    }

    console.log('Visible transaction amounts:', visibleAmounts);

    expect(visibleAmounts.length).toBeGreaterThan(0);

    console.log('Recent transactions verified successfully');
});


Then('the transactions are listed newest first', async () => {

    const timestamps = await $$(
        '//android.widget.TextView[@text="Recent Transactions"]' +
        '/following::android.widget.TextView' +
        '[contains(@text," ago")]'
    );

    const ages: number[] = [];
    const labels: string[] = [];

    for (const timestamp of timestamps) {

        if (!(await timestamp.isDisplayed())) {
            continue;
        }

        const text = await timestamp.getText();

        const match = text.match(/^(\d+)\s*([smhdw])\s+ago$/i);

        if (!match) {
            throw new Error(`Unsupported timestamp: ${text}`);
        }

        const units: Record<string, number> = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400,
            w: 604800
        };

        ages.push(
            Number(match[1]) * units[match[2].toLowerCase()]
        );

        labels.push(text);
    }

    expect(ages.length).toBeGreaterThanOrEqual(2);

    for (let i = 1; i < ages.length; i++) {
        expect(ages[i]).toBeGreaterThanOrEqual(ages[i - 1]);
    }

    console.log('Transaction timestamps:', labels);
    console.log('Displayed relative timestamps are newest first');

    if (new Set(ages).size !== ages.length) {
        console.warn(
            'Identical relative timestamps: exact ordering cannot be verified'
        );
    }
});

When('the user scrolls to the end of the dashboard', async () => {

    let canScrollMore = true;

    for (let i = 0; i < 10; i++) {

        canScrollMore = await scrollDashboardDown();

        if (!canScrollMore) {
            break;
        }
    }

    expect(canScrollMore).toBe(false);

    console.log('Reached the end of the dashboard');
});

Then('the View All control is reachable', async () => {

    await verifyText('View All');

    console.log('View All control is visible');
});

When('the user taps the View All control', async () => {

    const viewAll = await $(byText('View All'));

    await viewAll.waitForDisplayed({
        timeout: WAIT
    });

    await viewAll.click();

    console.log('Tapped View All');
});

Then('the full transaction history should be displayed', async () => {

    const historyHeading = await $(byText('Total Spending (May)'));

    await historyHeading.waitForDisplayed({
        timeout: 10000,
        timeoutMsg:
            'BUG-MOB-006: View All did not open the expected transaction history'
    });

    console.log('Transaction history opened successfully');
});

Then('additional transactions load if a pagination control is present', async () => {

    console.warn(
        'Pagination behaviour requires verification on the transaction history screen'
    );

    return 'pending';
});
// =====================================================
// T-MOB-DASH-003: Dashboard balance refresh
// =====================================================

Given('the user notes the current balance', async () => {

    balanceBefore = await readBalance();

    console.log(`Balance before refresh: ${balanceBefore}`);
});

When('the user refreshes the balance', async () => {

    const { width, height } = await driver.getWindowSize();

    await driver.execute('mobile: swipeGesture', {
        left: Math.round(width * 0.1),
        top: Math.round(height * 0.15),
        width: Math.round(width * 0.8),
        height: Math.round(height * 0.5),
        direction: 'down',
        percent: 0.85
    });

    console.log('Pull-to-refresh gesture performed');

    await verifyText('TOTAL NET WORTH');
});

Then('the dashboard still shows the total net worth', async () => {

    await verifyText('TOTAL NET WORTH');

    const balanceAfter = await readBalance();

    console.log(`Balance after gesture: ${balanceAfter}`);
});

Then('the balance remains consistent after refresh', async () => {

    const balanceAfter = await readBalance();

    expect(balanceAfter).toBe(balanceBefore);

    console.log(`Balance before: ${balanceBefore}`);
    console.log(`Balance after: ${balanceAfter}`);

    console.warn(
        'BUG-MOB-007: Balance is unchanged, but actual refresh functionality has not been verified'
    );

    return 'pending';
});