# Sonora Kids

Augmentative and Alternative Communication (AAC) app for autistic children, built with Expo / React Native.

Uses the PECS (Picture Exchange Communication System) methodology with a GraphQL backend, text-to-speech in Portuguese (pt-BR), haptic feedback, and animated interactions.

## Tech Stack

- **Expo SDK 54** (React Native 0.81.5, React 19)
- **Expo Router v6** — file-based navigation
- **NativeWind v4** + TailwindCSS — utility-first styling
- **@tanstack/react-query** — GraphQL data fetching & caching
- **react-native-reanimated v4** — spring animations
- **expo-speech** — TTS in pt-BR
- **expo-haptics** — tactile feedback

## Project Structure

```
mobile/
├── app/                  # Expo Router screens
│   ├── (tabs)/           # Bottom-tab screens (Pecs, Frases, Aprender, Rotina)
│   ├── profile.tsx       # Profile modal
│   └── settings.tsx      # Settings modal
├── components/           # PecCard, PhraseCard, SkeletonCard
├── constants/            # colors.ts, phrases.ts
├── hooks/                # useCategories (GraphQL)
├── services/             # graphqlClient
├── types/                # TypeScript interfaces
└── assets/               # fonts (Dongle), images
```

## Running

```bash
cd mobile
npx expo start --web --port 5000
```

Scan the QR code with **Expo Go** on your phone for the full native experience (haptics, TTS, animations).

## GraphQL Backend

`https://darkturquoise-stork-856497.hostingersite.com/graphql`

CORS is restricted on web preview — all features work fully via Expo Go on a physical device.
