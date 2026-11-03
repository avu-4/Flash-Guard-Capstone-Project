module.exports = {
  default: {
    paths: ['tests/ui/features/**/*.feature'],

    requireModule: [
      'dotenv/config',
      'ts-node/register'
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

