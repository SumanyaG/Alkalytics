module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: "ts-jest",

  // Test environment for React components
  testEnvironment: "jsdom",

  // Define where Jest should look for tests
  roots: ["<rootDir>/test"],

  // Match test files (including TypeScript)
  testMatch: ["**/?(*.)+(test).(ts|tsx|js|jsx)"],

  // Transform configuration
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  // Module handling
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Setup file to include jest-dom matchers
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
    },
  },
};
