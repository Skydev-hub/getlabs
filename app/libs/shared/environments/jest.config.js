module.exports = {
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: "<rootDir>/src/test-setup.ts",
  globals: {
    'ts-jest': {
      "tsConfig": "<rootDir>/tsconfig.spec.json"
    }
  }
};
