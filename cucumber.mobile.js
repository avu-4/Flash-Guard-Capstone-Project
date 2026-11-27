module.exports = {
  default: {
    paths: ['tests/mobile/features/**/*.feature'],
    requireModule: ['dotenv/config', 'tsx/cjs'],
    require: [
      'tests/mobile/support/**/*.ts',
      'tests/mobile/steps/**/*.ts'
    ],
    format: [
      'progress',
      'html:reports/cucumber-mobile-report.html',
      'json:reports/cucumber-mobile-report.json'
    ],
    publishQuiet: true
  }
};
