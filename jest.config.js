module.exports = {
  rootDir: ".",
  setupFiles: ["<rootDir>/jest.setup-once.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup-after-each.ts"],
  testMatch: [
    "<rootDir>/tests/**/*.ts*"
  ],
  moduleNameMapper: {
    "~/(.*)$": "<rootDir>/src/$1"
  },
  verbose: true
};
