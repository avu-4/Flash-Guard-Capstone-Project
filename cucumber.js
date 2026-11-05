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
  }
};