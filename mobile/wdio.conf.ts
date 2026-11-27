export const config: WebdriverIO.Config = {
    runner: 'local',

    specs: ['./e2e/specs/**/*.spec.ts'],

    maxInstances: 1,

    hostname: '127.0.0.1',
    port: 4723,
    path: '/',

    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:udid': 'emulator-5554',
        'appium:appPackage': 'com.anonymous.flashguadmobileapp',
        'appium:appActivity': '.MainActivity',
        'appium:noReset': true
    }],

    logLevel: 'info',
    framework: 'mocha',
    reporters: ['spec'],

    mochaOpts: {
        timeout: 60000
    }
};
