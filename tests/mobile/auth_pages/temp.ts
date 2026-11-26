const { remote } = require('webdriverio');
 
async function main() {
 
    // Connect to the Android application
    const driver = await remote({
        hostname: 'localhost',
        port: 4723,
        path: '/',
        capabilities: {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:deviceName': 'Pixel_6',
            'appium:app': './apps/swiftpay.apk'
        }
    });
 
    // Enter username
    await driver.$('~username-input').setValue('testuser');
 
    // Enter password
    await driver.$('~password-input').setValue('password123');
 
    // Tap Sign In
    await driver.$('~sign-in-button').click();
 
    // Tap Top Up
    await driver.$('~top-up-button').click();
 
    // Enter top-up amount
    await driver.$('~amount-input').setValue('100');
 
    // Tap Confirm
    await driver.$('~confirm-button').click();
 
    // Check if the top-up was successful
    const message = await driver.$('~status-message');
 
    await message.waitForDisplayed({ timeout: 10000 });
 
    const result = await message.getText();
 
    if (result === 'Top-up successful') {
        console.log('Test Passed: Top-up successful');
    } else {
        console.log('Test Failed: Top-up unsuccessful');
    }
 
    // Close the application session
    await driver.deleteSession();
}
 
main();
 