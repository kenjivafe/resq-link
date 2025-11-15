/// <reference types="jest" />

import "@testing-library/react-native/extend-expect";
import "react-native-gesture-handler/jestSetup";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import React from "react";

type BridgeGlobal = typeof globalThis & { __fbBatchedBridgeConfig?: unknown };

const ensureGlobalFetch = () => {
  if (!global.fetch) {
    global.fetch = jest.fn();
  }
};

const ensureNativeBridge = () => {
  const bridgeGlobal = global as BridgeGlobal;
  bridgeGlobal.__fbBatchedBridgeConfig ??= { remoteModuleConfig: [] };
};

const MOCK_SCHEME = "resqlink";

const mockDeviceConstants = {
  Dimensions: {
    window: { width: 375, height: 667, scale: 2, fontScale: 2 },
    screen: { width: 375, height: 667, scale: 2, fontScale: 2 },
  },
  isTesting: true,
  reactNativeVersion: { major: 0, minor: 0, patch: 0 },
  ExpoDomException: undefined,
};

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  launchImageLibraryAsync: jest
    .fn()
    .mockResolvedValue({ canceled: true, assets: [] }),
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
  },
}));

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    manifest: {
      scheme: MOCK_SCHEME,
    },
    appOwnership: "standalone",
    executionEnvironment: "standalone",
    platform: {
      ios: {
        buildNumber: "1",
        platform: "ios",
      },
      android: {
        versionCode: 1,
        platform: "android",
      },
    },
  },
}));

jest.mock(
  "expo-auth-session",
  () => {
    const makeRedirectUri = jest.fn(() => `${MOCK_SCHEME}://auth`);
    return {
      __esModule: true,
      makeRedirectUri,
      default: {
        makeRedirectUri,
      },
    };
  },
  { virtual: true },
);

jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => ({
  getEnforcing: () => ({
    getConstants: () => mockDeviceConstants,
  }),
  get: () => ({
    getConstants: () => mockDeviceConstants,
  }),
}));

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter", () => {
  const mockEmitter = jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeListeners: jest.fn(),
    listenerCount: jest.fn().mockReturnValue(0),
  }));

  return mockEmitter;
});

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid-0000"),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper", () => ({}), {
  virtual: true,
});

ensureGlobalFetch();
ensureNativeBridge();
