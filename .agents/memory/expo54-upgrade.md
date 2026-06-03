---
name: Expo 54 upgrade
description: Package versions and babel setup required for Expo SDK 54 with Reanimated v4.
---

## Expo SDK 54 compatible package versions
- expo: ~54.0.35
- expo-router: ~6.0.24  (NOTE: jumped from v5 in SDK 53 to v6 in SDK 54)
- react: 19.1.0
- react-dom: 19.1.0
- react-native: 0.81.5
- react-native-reanimated: ~4.1.1
- react-native-worklets: 0.5.1  (new peer dep in reanimated v4; must be same version as expected by expo)
- react-native-gesture-handler: ~2.28.0
- react-native-safe-area-context: ~5.6.0
- react-native-screens: ~4.16.0
- react-native-web: ^0.21.0
- @expo/vector-icons: ^15.0.3
- expo-blur: ~15.0.8
- expo-constants: ~18.0.13
- expo-font: ~14.0.12
- expo-haptics: ~15.0.8
- expo-linking: ~8.0.12
- expo-speech: ~14.0.8
- expo-splash-screen: ~31.0.13
- expo-status-bar: ~3.0.9
- expo-system-ui: ~6.0.9
- typescript: ~5.9.2
- @types/react: ~19.1.10

## Reanimated v4 + worklets babel setup
In v4, reanimated split worklets into `react-native-worklets`. The reanimated babel plugin
internally requires it. Only list `react-native-reanimated/plugin` in babel.config.js —
do NOT also add `react-native-worklets/plugin` or you get "Duplicate plugin" error.

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

**Why:** reanimated v4 plugin.js requires worklets internally via `require('react-native-worklets/plugin')`.
Adding worklets to plugins separately causes Babel "Duplicate plugin detected" error.

## Install command
```
npm install --legacy-peer-deps
```
Always use `--legacy-peer-deps` in this project to avoid peer dependency conflicts.
