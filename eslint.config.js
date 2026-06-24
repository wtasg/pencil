const js = require("@eslint/js");
const typescript = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
    {
        ignores: [
            "node_modules/",
            "dist/",
            "*.config.js",
            "app/vendor/",
            "app/lib/codemirror/",
            "app/archive/",
            "test-results/",
            "register-ts.js"
        ]
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module"
            },
            globals: {
                // Browser globals
                document: "readonly",
                window: "readonly",
                // Node globals
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                // Jest globals
                describe: "readonly",
                it: "readonly",
                test: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly"
            }
        },
        plugins: {
            "@typescript-eslint": typescript
        },
        rules: {
            ...js.configs.recommended.rules,
            ...typescript.configs.recommended.rules,
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-this-alias": "off",
            "no-console": "off",
            "no-undef": "off",
            "no-require-imports": "off",
            "no-unused-vars": "off",
            "no-useless-escape": "warn",
            "preserve-caught-error": "off",
            "prefer-catch-binding": "off"
        }
    }
];
