# Sonora Kids

Augmentative and Alternative Communication (AAC) app for autistic children, built with **Expo / React Native**.

Uses the PECS (Picture Exchange Communication System) methodology with local catalog data, text-to-speech in Portuguese (pt-BR), haptic feedback, and animated interactions.

## Tech Stack

- **Expo SDK 57** (React Native 0.86.3, React 19.2)
- **Expo Router v6** — file-based navigation
- **NativeWind v4** + TailwindCSS — utility-first styling
- **TypeScript**
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
├── constants/            # colors, phrases, category icons
├── data/                 # Local PECS category catalog (mock)
├── hooks/                # useCategories
├── types/                # TypeScript interfaces
└── assets/               # fonts (Dongle), images
```

## Running

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone for the full native experience (haptics, TTS, animations).

For web preview:

```bash
npx expo start --web
```

## Data

PECS categories and cards are loaded from `mobile/data/categories.ts` (offline snapshot of the original WordPress catalog). No backend or authentication is required to run the app.

Settings toggles and profile content are local UI state only.
