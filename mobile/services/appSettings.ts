import AsyncStorage from "@react-native-async-storage/async-storage";
import { Voice, VoiceQuality } from "expo-speech";

const STORAGE_KEY = "sonora.settings";

export type VoiceGender = "feminine" | "masculine";
export type SpeechRate = "slow" | "normal" | "fast";
export type SpeechLanguage = "pt-BR" | "pt-PT";

export interface AppSettings {
  voiceGender: VoiceGender;
  voiceId: string | null;
  language: SpeechLanguage;
  speechRate: SpeechRate;
  autoSpeakCategories: boolean;
  haptics: boolean;
  largeText: boolean;
  highContrast: boolean;
}

/** Current layout sizes. Used when "Texto grande" is on. */
export const LARGE_FONT_SCALE = 1;
/** Quicksand Bold reads large at those sizes, so the default sits a step below. */
export const DEFAULT_FONT_SCALE = 0.85;

export const DEFAULT_SETTINGS: AppSettings = {
  voiceGender: "feminine",
  voiceId: null,
  language: "pt-BR",
  speechRate: "normal",
  autoSpeakCategories: true,
  haptics: true,
  largeText: false,
  highContrast: false,
};

export const SPEECH_RATES: Record<SpeechRate, number> = {
  slow: 0.75,
  normal: 1,
  fast: 1.2,
};

export const SPEECH_RATE_LABELS: Record<SpeechRate, string> = {
  slow: "Devagar",
  normal: "Normal",
  fast: "Rápida",
};

const FEMININE_HINTS = [
  "luciana",
  "fernanda",
  "francisca",
  "vitória",
  "vitoria",
  "alice",
  "camila",
  "helena",
  "maria",
  "joana",
  "feminina",
  "female",
  "woman",
  "salli",
  "joanna",
  "victoria",
  "fiona",
  "karen",
  "sara",
  "samantha",
  "grandma",
  "flo",
  "sandy",
  "shelley",
];

const MASCULINE_HINTS = [
  "felipe",
  "ricardo",
  "antônio",
  "antonio",
  "daniel",
  "jorge",
  "carlos",
  "masculin",
  "male",
  "man",
  "fred",
  "ravi",
  "grandpa",
  "eddy",
  "reed",
  "rocko",
];

export function normalizeLanguage(language: string) {
  return language.toLowerCase().replace(/_/g, "-");
}

export function isPortuguese(language: string) {
  return normalizeLanguage(language).startsWith("pt");
}

export function inferVoiceGender(voice: Pick<Voice, "name" | "identifier">): VoiceGender | null {
  const haystack = `${voice.name} ${voice.identifier}`.toLowerCase();
  if (FEMININE_HINTS.some((hint) => haystack.includes(hint)) || /[-_](afs|sfs)\b/.test(haystack)) {
    return "feminine";
  }
  if (MASCULINE_HINTS.some((hint) => haystack.includes(hint)) || /[-_](amf|sma)\b/.test(haystack)) {
    return "masculine";
  }
  return null;
}

export function genderLabel(gender: VoiceGender) {
  return gender === "feminine" ? "Feminina" : "Masculina";
}

function languageScore(language: string, preferred: SpeechLanguage) {
  const code = normalizeLanguage(language);
  if (code.startsWith(preferred.toLowerCase())) return 100;
  if (code.startsWith("pt-br")) return 60;
  if (code.startsWith("pt")) return 30;
  return 0;
}

function rankVoice(voice: Voice, gender: VoiceGender, language: SpeechLanguage) {
  let score = languageScore(voice.language, language);
  if (inferVoiceGender(voice) === gender) score += 50;
  if (voice.quality === VoiceQuality.Enhanced) score += 10;
  return score;
}

export function listSpeakableVoices(voices: Voice[], language: SpeechLanguage) {
  const preferred = voices.filter((voice) =>
    normalizeLanguage(voice.language).startsWith(language.toLowerCase()),
  );
  const portuguese = voices.filter((voice) => isPortuguese(voice.language));
  const source = preferred.length ? preferred : portuguese.length ? portuguese : voices;
  return [...source].sort((a, b) => a.name.localeCompare(b.name, "pt"));
}

export function resolveSpeech(voices: Voice[], settings: AppSettings) {
  const selected = settings.voiceId
    ? voices.find((voice) => voice.identifier === settings.voiceId)
    : undefined;
  if (selected) {
    const code = normalizeLanguage(selected.language);
    return {
      voice: selected.identifier,
      pitch: 1,
      language: code.startsWith("pt") ? selected.language : settings.language,
    };
  }

  const ranked = [...voices].sort(
    (a, b) => rankVoice(b, settings.voiceGender, settings.language) - rankVoice(a, settings.voiceGender, settings.language),
  );
  const best = ranked.find((voice) => languageScore(voice.language, settings.language) > 0) ?? ranked[0];
  const matched = best && inferVoiceGender(best) === settings.voiceGender;
  return {
    voice: best?.identifier,
    pitch: matched ? 1 : settings.voiceGender === "masculine" ? 0.82 : 1.12,
    language: settings.language,
  };
}

export function voiceSummary(voices: Voice[], settings: AppSettings) {
  if (settings.voiceId) {
    const selected = voices.find((voice) => voice.identifier === settings.voiceId);
    if (selected) {
      const inferred = inferVoiceGender(selected);
      return inferred ? `${selected.name} · ${genderLabel(inferred)}` : selected.name;
    }
  }
  return genderLabel(settings.voiceGender);
}

function isSpeechRate(value: unknown): value is SpeechRate {
  return value === "slow" || value === "normal" || value === "fast";
}

function isSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== "object") return false;
  const settings = value as AppSettings;
  return (
    (settings.voiceGender === "feminine" || settings.voiceGender === "masculine") &&
    (settings.voiceId === null || typeof settings.voiceId === "string") &&
    (settings.language === "pt-BR" || settings.language === "pt-PT") &&
    isSpeechRate(settings.speechRate) &&
    typeof settings.autoSpeakCategories === "boolean" &&
    typeof settings.haptics === "boolean" &&
    typeof settings.largeText === "boolean" &&
    typeof settings.highContrast === "boolean"
  );
}

export async function loadAppSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  const parsed: unknown = JSON.parse(raw);
  if (!isSettings(parsed)) return DEFAULT_SETTINGS;
  return parsed;
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
