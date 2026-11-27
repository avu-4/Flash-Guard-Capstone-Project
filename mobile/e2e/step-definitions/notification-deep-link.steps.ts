import { Given, When, Then } from '@wdio/cucumber-framework';

const notificationSelector =
    '//*[contains(@text,"Transfer Alert")]';

Given('the user has received a transfer alert notification', async () => {

    await driver.openNotifications();

    await $(notificationSelector).waitForDisplayed({
        timeout: 15000,
        timeoutMsg: 'Transfer alert notification not received'
    });
});

When('the user opens the notification panel', async () => {
    await driver.openNotifications();
});

When('the user taps the transfer alert notification', async () => {

    const notification = await $(notificationSelector);

    await notification.waitForDisplayed({
        timeout: 15000
    });

    await notification.click();
});

Then('the FlashGuard application should open', async () => {

    await driver.waitUntil(async () => {
        return await driver.getCurrentPackage() ===
            'com.anonymous.flashguadmobileapp';
    }, {
        timeout: 15000,
        timeoutMsg: 'FlashGuard did not open from the notification'
    });
});

Then('the relevant transfer detail page should be displayed', () => {
    return 'pending';
});

Then('the transfer details should match the notification', () => {
    return 'pending';
});