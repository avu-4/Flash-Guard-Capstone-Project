module.exports = {
    default: {
        paths: [
            'tests/integration/features/**/*.feature'
        ],

        requireModule: [
            'dotenv/config',
            'tsx/cjs'
        ],

        require: [
            'src/support/**/*.ts',
            'tests/ui/hooks/**/*.ts',
            'tests/integration/steps/**/*.ts'
        ],

        format: [
            'progress',
            'html:reports/integration-report.html',
            'json:reports/integration-report.json'
        ]
    }
};