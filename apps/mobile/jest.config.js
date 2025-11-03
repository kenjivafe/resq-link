/* eslint-disable @typescript-eslint/no-require-imports */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const iosPreset = require('jest-expo/ios/jest-preset');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const androidPreset = require('jest-expo/android/jest-preset');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const webPreset = require('jest-expo/web/jest-preset');

const baseConfig = {
  setupFilesAfterEnv: [require.resolve('./jest.setup.ts')],
  moduleNameMapper: {
    '^.+\\.(png|jpe?g|gif|svg)$': '<rootDir>/__mocks__/fileMock.ts',
    '^@react-navigation/native$': '<rootDir>/__mocks__/react-navigation-native.ts',
    '^@react-navigation/native-stack$': '<rootDir>/__mocks__/react-navigation-native-stack.ts',
    '^@/testing-library/react-native$': '<rootDir>/testing/testing-library/react-native.ts',
    '^@/(.*)$': '<rootDir>/app/$1'
  },
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!((?:\\.pnpm/[^/]+/node_modules/)?((jest-)?react-native|@react-native(-community)?|@react-navigation|expo(nent)?|@expo(nent)?|expo-.*|@expo-.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))/)'
  ]
};

module.exports = {
  projects: [
    {
      displayName: 'ios',
      ...iosPreset,
      ...baseConfig
    },
    {
      displayName: 'android',
      ...androidPreset,
      ...baseConfig
    },
    {
      displayName: 'web',
      ...webPreset,
      ...baseConfig,
      testMatch: ['<rootDir>/__tests__/web/**/*.(test|spec).[jt]sx?']
    }
  ]
};
