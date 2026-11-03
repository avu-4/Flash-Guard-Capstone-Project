module.exports = {
  default: {
    paths: ["tests/ui/feature/**/*.feature"],
    requireModule: ["tsx/cjs"],
    require: [
      "tests/ui/world/**/*.ts",
      "tests/ui/hooks/**/*.ts",
      "tests/ui/steps/**/*.ts",
    ],
    format: ["progress-bar", "html:reports/cucumber-report.html"],
  },
};