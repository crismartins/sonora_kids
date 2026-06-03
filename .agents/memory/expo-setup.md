---
name: Sonora Kids Expo setup
description: How the Expo React Native app is structured, key version constraints, and asset path rules.
---

## Project layout
- Expo app lives in `mobile/` subdirectory of the Flutter project root
- Workflow command: `cd mobile && PORT=5000 npx expo start --web --port 5000`
- Assets are COPIED into `mobile/assets/fonts/` and `mobile/assets/images/` — Metro bundler cannot reach files outside the project root, so never use `require('../../assets/...')` paths that escape `mobile/`

## Working versions (Expo SDK 53)
- react: 19.0.0
- react-dom: 19.0.0
- react-native: 0.79.6
- expo-router: ~5.1.11
- react-native-web: ~0.20.0 (required for web support)
- nativewind: ^4.1.23 + tailwindcss: 3.4.17

**Why:** Expo 53 requires React 19. Using React 18 causes a blank white screen (no crash, silent failure).

## NativeWind v4 setup
- `babel.config.js`: preset `["babel-preset-expo", { jsxImportSource: "nativewind" }]`
- `metro.config.js`: `withNativeWind(config, { input: "./global.css" })`
- `global.css` imported at top of `app/_layout.tsx`
- `nativewind-env.d.ts` for TypeScript types

## Deprecated web APIs to avoid
- `shadow*` style props (shadowColor, shadowOffset, etc.) — use `boxShadow` on web via Platform.OS check
- `props.pointerEvents` — use `style.pointerEvents`

## Font loading
- Dongle font files must be in `mobile/assets/fonts/` (not referenced from parent)
- Loaded via `useFonts` in `_layout.tsx` with `require('../assets/fonts/Dongle-*.ttf')`
- `if (!fontsLoaded && !fontError) return null` guard blocks render until fonts ready
