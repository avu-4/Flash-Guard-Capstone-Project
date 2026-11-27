module.exports = {
  default: {
    paths: ['tests/mobile/features/authentication.feature'],
    requireModule: ['tsx/cjs'],
    require: [
      'tests/mobile/auth_support/env.ts',
      'tests/mobile/auth_support/world.ts',
      'tests/mobile/auth_support/hooks.ts',
      'tests/mobile/auth_steps/**/*.ts'
    ],
    format: [
      'progress',
      'html:reports/mobile-cucumber-report.html',
      'json:reports/mobile-cucumber-report.json'
    ],
    publishQuiet: true
  }
};
