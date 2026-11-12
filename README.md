# Sonora Kids

Augmentative and Alternative Communication (AAC) app for autistic children, built with **Expo / React Native**.

Uses the PECS (Picture Exchange Communication System) methodology with a local catalog, text-to-speech, haptic feedback, and activities for practice.

## Tech Stack

- **Expo SDK 58** (React Native 0.88, React 19.3)
- **Expo Router** — file-based navigation
- **NativeWind v4** + TailwindCSS — utility-first styling
- **TypeScript**
- **react-native-reanimated v4** — spring animations
- **expo-speech** — text-to-speech
- **expo-haptics** — tactile feedback

## Project Structure

```
mobile/
├── app/                  # Expo Router screens
│   ├── (tabs)/           # PECs, Frases, Aprender, Rotina
│   ├── atividade/        # Memory, find, repeat, phrase, and story
│   ├── profile.tsx       # Profile
│   └── settings.tsx      # Settings
├── components/           # Cards, forms, activities
├── constants/            # colors, phrases, category icons
├── data/                 # Local PECS catalog, stories, play pools
├── hooks/                # Categories, custom PECs, routine
├── services/             # Device storage, speech, purchases
├── i18n/                 # Portuguese, English, and Spanish copy
└── assets/               # fonts and images
```

## Running

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone for haptics, text-to-speech, and animations.

Speech recognition in **Repita comigo** needs an installed build (`npx expo run:ios` or `npx expo run:android`). Expo Go does not include that native module.

For web preview:

```bash
npx expo start --web
```

## Data

PECS categories and cards are loaded from `mobile/data/categories.ts` (offline snapshot of the original catalog). No backend or authentication is required to run the app.

Profile, settings, custom PECs, phrases, and the routine are stored on the device.
