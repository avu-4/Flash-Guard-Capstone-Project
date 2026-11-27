import { When, Then } from '@wdio/cucumber-framework';

const historyTab = '//*[@clickable="true" and contains(@content-desc,", History")]';

const historyScreen = '//*[@text="Total Spending (May)"]';

const listItem = '//*[@text="Transfer #3"]';

// Provisional context menu selector
const contextMenu = '//android.widget.ListView';

// Tap History
When('the user taps on the target element', async () => {
    const target = await $(historyTab);

    await target.waitForDisplayed({
        timeout: 15000
    });

    await target.click();
});

// Verify History screen
Then('the expected tap result should be displayed', async () => {
    await $(historyScreen).waitForDisplayed({
        timeout: 15000,
        timeoutMsg: 'History screen did not open'
    });

    console.log('History screen opened successfully');
});

// Perform long-press
When('the user long-presses the list item for 1000 milliseconds', async () => {
    const item = await $(listItem);

    await item.waitForDisplayed({
        timeout: 15000
    });

    console.log(
        'Long-clickable:',
        await item.getAttribute('long-clickable')
    );

    await driver.execute('mobile: longClickGesture', {
        elementId: item.elementId,
        duration: 1000
    });

    console.log('Long-press performed on Transfer #3');
});

// Verify context menu
Then('the context menu should be displayed', async () => {
    await $(contextMenu).waitForDisplayed({
        timeout: 10000,
        timeoutMsg: 'Context menu not displayed after long-press on Transfer #3'
    });
});

// Dismiss context menu
When('the user dismisses the context menu', async () => {
    await driver.back();
});

// Perform short tap
When('the user performs a short tap on the list item', async () => {
    const item = await $(listItem);

    await item.waitForDisplayed({
        timeout: 10000
    });

    await item.click();
});

// Verify context menu is not displayed
Then('the context menu should not be displayed', async () => {
    await expect($(contextMenu)).not.toBeDisplayed();
});