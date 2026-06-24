module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ["<rootDir>/tests/**/*.test.ts"],
    testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/app/dist/"],
    roots: ["<rootDir>/tests"],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                esModuleInterop: true,
                allowJs: true,
                strict: false,
                noImplicitAny: false
            },
            transpileOnly: true
        }]
    },
};
