
module.exports = {
  default: {
    paths: [
      'tests/ui/features/**/*.feature',
      'tests/ui/feature/**/*.feature'
    ],

    requireModule: [
      'dotenv/config',
      'tsx/cjs'
    ],

    require: [
      'src/support/**/*.ts',
      'tests/ui/steps/**/*.ts',
      'tests/ui/hooks/**/*.ts'
    ],

    format: [
      'progress',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],

    publishQuiet: true
  },

  mobile: {
    paths: [
      'tests/mobile/mobile-dashboard.feature'
    ],

    requireModule: [
      'dotenv/config',
      'tsx/cjs'
    ],

    require: [
      'tests/mobile/mobile-driver.ts',
      'tests/mobile/mobile-dashboard.steps.ts'
    ],

    format: ['progress']
  }
};
