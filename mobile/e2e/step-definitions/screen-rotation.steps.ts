import { Given, When, Then } from '@wdio/cucumber-framework';

const dashboardSelector =
    '//android.widget.TextView[@text="TOTAL NET WORTH"]';

Given('the screen is in portrait orientation', async () => {
    await driver.setOrientation('PORTRAIT');

    expect(await driver.getOrientation()).toBe('PORTRAIT');

    console.log('Initial orientation: PORTRAIT');
});

Given('the screen height is greater than the screen width', async () => {
    const portrait = await driver.getWindowSize();

    console.log('Portrait dimensions:', portrait);

    expect(portrait.height).toBeGreaterThan(portrait.width);
});

When('the user rotates the device to landscape orientation', async () => {
    await driver.setOrientation('LANDSCAPE');
    await browser.pause(1000);
});

Then('the screen orientation should be landscape', async () => {
    expect(await driver.getOrientation()).toBe('LANDSCAPE');

    console.log('Landscape orientation verified');
});

Then('the screen width should be greater than the screen height', async () => {
    const landscape = await driver.getWindowSize();

    console.log('Landscape dimensions:', landscape);

    expect(landscape.width).toBeGreaterThan(landscape.height);
});

Then('the Dashboard should remain displayed', async () => {
    await $(dashboardSelector).waitForDisplayed({
        timeout: 15000,
        timeoutMsg: 'Dashboard not displayed after screen rotation'
    });

    console.log('Dashboard state preserved');
});

When('the user rotates the device back to portrait orientation', async () => {
    await driver.setOrientation('PORTRAIT');
    await browser.pause(1000);
});

Then('the screen orientation should be portrait', async () => {
    expect(await driver.getOrientation()).toBe('PORTRAIT');

    console.log('Portrait orientation restored');
});