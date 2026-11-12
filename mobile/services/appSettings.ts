import AsyncStorage from "@react-native-async-storage/async-storage";
import { Voice, VoiceQuality } from "expo-speech";

const STORAGE_KEY = "sonora.settings";

export type VoiceGender = "feminine" | "masculine";
export type SpeechRate = "slow" | "normal" | "fast";
export type SpeechLanguage = "pt-BR" | "pt-PT" | "en" | "es";

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

export const SPEECH_LANGUAGE_LABELS: Record<SpeechLanguage, string> = {
  "pt-BR": "Português (Brasil)",
  "pt-PT": "Português (Portugal)",
  en: "Inglês",
  es: "Espanhol",
};

const SPEECH_LANGUAGE_NAMES: Record<SpeechLanguage, string> = {
  "pt-BR": "português do Brasil",
  "pt-PT": "português de Portugal",
  en: "inglês",
  es: "espanhol",
};

export function speechLanguageName(language: SpeechLanguage) {
  return SPEECH_LANGUAGE_NAMES[language];
}

export function voicePreview(language: SpeechLanguage) {
  if (language === "en") return "Hello. I want to play.";
  if (language === "es") return "Hola. Quiero jugar.";
  return "Olá. Eu quero brincar.";
}

export function languagePreview(language: SpeechLanguage) {
  if (language === "en") return "Hello. This is the voice language.";
  if (language === "es") return "Hola. Este es el idioma de la voz.";
  return "Olá. Este é o idioma da voz.";
}

export function ratePreview(language: SpeechLanguage) {
  if (language === "en") return "This is the speaking speed.";
  if (language === "es") return "Esta es la velocidad del habla.";
  return "Esta é a velocidade da fala.";
}

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
  "allison",
  "ava",
  "nicky",
  "kate",
  "serena",
  "moira",
  "tessa",
  "zoe",
  "susan",
  "alexa",
  "monica",
  "mónica",
  "paulina",
  "soledad",
  "elena",
  "lucia",
  "lucía",
  "marisol",
  "esperanza",
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
  "alex",
  "aaron",
  "nathan",
  "oliver",
  "arthur",
  "rishi",
  "gordon",
  "diego",
  "enrique",
  "pablo",
  "miguel",
  "juan",
];

export function normalizeLanguage(language: string) {
  return language.toLowerCase().replace(/_/g, "-");
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

export function listSpeakableVoices(voices: Voice[], language: SpeechLanguage, gender: VoiceGender) {
  return voices
    .filter(
      (voice) =>
        normalizeLanguage(voice.language).startsWith(language.toLowerCase()) &&
        inferVoiceGender(voice) === gender,
    )
    .sort((a, b) => a.name.localeCompare(b.name, "pt"));
}

function preferredVoice(voices: Voice[]) {
  return [...voices].sort((a, b) => {
    const quality = Number(b.quality === VoiceQuality.Enhanced) - Number(a.quality === VoiceQuality.Enhanced);
    if (quality !== 0) return quality;
    return a.name.localeCompare(b.name, "pt");
  })[0];
}

export function resolveSpeech(
  voices: Voice[],
  settings: Pick<AppSettings, "voiceId" | "voiceGender" | "language">,
) {
  const compatible = listSpeakableVoices(voices, settings.language, settings.voiceGender);
  const selected =
    (settings.voiceId ? compatible.find((voice) => voice.identifier === settings.voiceId) : undefined) ??
    preferredVoice(compatible);

  if (selected) {
    return {
      voice: selected.identifier,
      pitch: 1,
      language: selected.language,
    };
  }

  return {
    voice: undefined,
    pitch: settings.voiceGender === "masculine" ? 0.82 : 1.12,
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
    (settings.language === "pt-BR" ||
      settings.language === "pt-PT" ||
      settings.language === "en" ||
      settings.language === "es") &&
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
