import { When, Then } from '@wdio/cucumber-framework';

// Open Settings
When('the user opens Settings', async () => {
    const settings = await $(
        '//android.widget.TextView[@text="⚙"]'
    );

    await settings.waitForDisplayed({ timeout: 10000 });
    await settings.click();

    const changePassword = await $(
        '//*[@text="Change Password"]'
    );

    await changePassword.waitForDisplayed({
        timeout: 15000,
        timeoutMsg: 'Settings did not open or Change Password is unavailable'
    });
});

// Select Change Password
When('the user selects Change Password', async () => {
    const changePassword = await $('//*[@text="Change Password"]');
    await changePassword.click();
});

// Pending password steps
When('the user enters their current password', () => {
    return 'pending';
});

When('the user enters a valid new password', () => {
    return 'pending';
});

When('the user confirms the new password', () => {
    return 'pending';
});

When('the user clicks the Save Password button', () => {
    return 'pending';
});

Then('a password change success message should be displayed', () => {
    return 'pending';
});

When('the user logs in with the new password', () => {
    return 'pending';
});

Then('the user should be successfully authenticated', () => {
    return 'pending';
});