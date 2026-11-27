import { Given, When, Then } from '@wdio/cucumber-framework';

// Launch application
Given('the user has launched the FlashGuard application', async () => {
    await driver.activateApp('com.anonymous.flashguadmobileapp');
});

// Login
Given('the user is logged in with valid credentials', async () => {

    const signIn = await $('~Sign In, ›');

    const dashboard = await $(
        '//android.widget.TextView[@text="TOTAL NET WORTH"]'
    );

    const okButton = await $(
        '//android.widget.Button[@text="OK"]'
    );

    await driver.waitUntil(async () => {
        return await signIn.isDisplayed() ||
               await dashboard.isDisplayed() ||
               await okButton.isDisplayed();
    }, {
        timeout: 30000,
        timeoutMsg: 'Login screen or Dashboard not found'
    });

    if (await signIn.isDisplayed()) {
        await signIn.click();
        await okButton.waitForDisplayed({ timeout: 15000 });
        await okButton.click();
    } else if (await okButton.isDisplayed()) {
        await okButton.click();
    }

    await dashboard.waitForDisplayed({ timeout: 20000 });
});

// Navigate to Account
When('the user navigates to the Account tab', async () => {
    const profile = await $(
        '//android.widget.TextView[@text="Private banking profile and settings"]'
    );

    if (!(await profile.isDisplayed())) {
        const account = await $('~PF, Account');

        await account.waitForDisplayed({ timeout: 20000 });
        await account.click();
    }

    await profile.waitForDisplayed({
        timeout: 20000,
        timeoutMsg: 'Account screen failed to open'
    });

    console.log('Account screen opened successfully');
});

// Open profile settings
When('the user opens the profile settings', async () => {
    const settings = await $('//android.widget.TextView[@text="⚙"]');
    await settings.waitForDisplayed({ timeout: 10000 });
    await settings.click();

    const editField = await $('//android.widget.EditText');
    await editField.waitForDisplayed({ timeout: 15000 });
});
Given('the Dashboard is displayed', async () => {
    const dashboard = await $(
        '//android.widget.TextView[@text="TOTAL NET WORTH"]'
    );

    await dashboard.waitForDisplayed({ timeout: 20000 });
});

// Pending profile update steps

When('the user updates their first name to {string}', (_value: string) => {
    return 'pending';
});

When('the user updates their last name to {string}', (_value: string) => {
    return 'pending';
});

When('the user updates their phone number to {string}', (_value: string) => {
    return 'pending';
});

When('the user clicks the Save Profile button', () => {
    return 'pending';
});

Then('a profile update success message should be displayed', () => {
    return 'pending';
});

When('the user logs out', () => {
    return 'pending';
});

When('the user logs in again with valid credentials', () => {
    return 'pending';
});

Then('the first name should be {string}', (_value: string) => {
    return 'pending';
});

Then('the last name should be {string}', (_value: string) => {
    return 'pending';
});

Then('the phone number should be {string}', (_value: string) => {
    return 'pending';
});