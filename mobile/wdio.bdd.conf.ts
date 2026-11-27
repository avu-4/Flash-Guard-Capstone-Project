import { config as baseConfig } from './wdio.conf';

export const config: WebdriverIO.Config = {
    ...baseConfig,

    specs: ['./e2e/features/**/*.feature'],

    framework: 'cucumber',

    cucumberOpts: {
        require: ['./e2e/step-definitions/**/*.ts'],
        timeout: 60000
    }
};