module.exports = {
  default: {
    paths: ['tests/e2e/features/**/*.feature'],

    requireModule: [
      'dotenv/config',
      'tsx/cjs'
    ],

    require: [
      'tests/e2e/support/**/*.ts',
      'tests/e2e/steps/**/*.ts'
    ],

    format: [
      'progress',
      'html:reports/cucumber-e2e-report.html',
      'json:reports/cucumber-e2e-report.json'
    ],

    publishQuiet: true
  }
};