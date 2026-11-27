import { Given, When, Then } from '@wdio/cucumber-framework';

const appPackage = 'com.anonymous.flashguadmobileapp';

Given('the FlashGuard notification permission is reset', async () => {

    await driver.execute('mobile: startActivity', {
        action: 'android.settings.APP_NOTIFICATION_SETTINGS',
        extras: [
            ['s', 'android.provider.extra.APP_PACKAGE', appPackage]
        ]
    });

    const unavailable = $(
        '//*[@text="This app does not send notifications"]'
    );

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
            'Cannot reset notification permission: This app does not send notifications'
        );
    }

    expect(await permissionSwitch.isEnabled()).toBe(true);

    return 'pending';
});

Given('the notification permission prompt is displayed', async () => {

    const allowButton = $(
        '//*[@resource-id="com.android.permissioncontroller:id/permission_allow_button"]'
    );

    await allowButton.waitForDisplayed({
        timeout: 15000,
        timeoutMsg: 'Notification permission prompt not displayed'
    });
});

When('the user selects {string}', async (permission: string) => {

    const buttonId = permission === 'Allow'
        ? 'permission_allow_button'
        : 'permission_deny_button';

    const button = $(
        `//*[@resource-id="com.android.permissioncontroller:id/${buttonId}"]`
    );

    await button.waitForDisplayed({
        timeout: 10000
    });

    await button.click();
});

Then('the notification permission status should be {string}',
    async (status: string) => {

        await driver.execute('mobile: startActivity', {
            action: 'android.settings.APP_NOTIFICATION_SETTINGS',
            extras: [
                ['s', 'android.provider.extra.APP_PACKAGE', appPackage]
            ]
        });

        const permissionSwitch = $('//android.widget.Switch');

        await permissionSwitch.waitForDisplayed({
            timeout: 15000
        });

        const checked = await permissionSwitch.getAttribute('checked');

        expect(checked).toBe(
            status === 'Granted' ? 'true' : 'false'
        );

        await driver.activateApp(appPackage);
});

Then('the notification delivery result should be {string}',
    (_result: string) => {
        return 'pending';
});