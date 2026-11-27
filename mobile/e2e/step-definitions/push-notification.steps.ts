import { Given, When, Then } from '@wdio/cucumber-framework';

const appPackage = 'com.anonymous.flashguadmobileapp';

Given('notification permissions are granted', async () => {

    await driver.execute('mobile: startActivity', {
        action: 'android.settings.APP_NOTIFICATION_SETTINGS',
        extras: [
            ['s', 'android.provider.extra.APP_PACKAGE', appPackage]
        ]
    });

    const unavailable = $('//*[@text="This app does not send notifications"]');

    const permissionSwitch = $('//android.widget.Switch');

    await driver.waitUntil(async () => {
        return await unavailable.isDisplayed() ||
               await permissionSwitch.isDisplayed();
    }, {
        timeout: 15000,
        timeoutMsg: 'Notification settings could not be verified'
    });

    if (await unavailable.isDisplayed()) {
        throw new Error(
            'Notification functionality unavailable: This app does not send notifications'
        );
    }

    expect(await permissionSwitch.isEnabled()).toBe(true);

    expect(await permissionSwitch.getAttribute('checked'))
        .toBe('true');

    await driver.activateApp(appPackage);

    console.log('Notification permissions verified');
});

When('the user places the application in the background', async () => {
    await driver.pressKeyCode(3);
});

When('a transfer alert is triggered', () => {
    return 'pending';
});

Then('a push notification should be received', () => {
    return 'pending';
});

Then('the notification should be displayed in the notification panel', () => {
    return 'pending';
});

Then('the notification should contain the transfer alert information', () => {
    return 'pending';
});