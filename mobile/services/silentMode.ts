import { Platform } from "react-native";
import { canDetectSilentMode, isSilentModeEnabled } from "speech-silence";

const DETECTED_MESSAGE = "Modo silencioso ativado. Desative para ouvir a voz.";
const UNKNOWN_MESSAGE = "Se o modo silencioso estiver ligado, a voz não sai. Desative para ouvir.";
const TOAST_MS = 5200;
const CACHE_MS = 3000;

type Listener = (message: string | null) => void;

let listeners = new Set<Listener>();
let current: string | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let cached: { at: number; silenced: boolean } | null = null;
let inFlight: Promise<boolean | null> | null = null;
let hintedWithoutDetector = false;

function emit(message: string | null) {
  current = message;
  listeners.forEach((listener) => listener(message));
}

export function showSilentModeToast(message: string) {
  emit(message);
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => emit(null), TOAST_MS);
}

export function hideSilentModeToast() {
  if (!current) return;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = null;
  emit(null);
}

export function subscribeSilentModeToast(listener: Listener) {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}

function readSilent(): Promise<boolean | null> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return Promise.resolve(cached.silenced);
  if (!inFlight) {
    inFlight = isSilentModeEnabled()
      .then((silenced) => {
        if (silenced != null) cached = { at: Date.now(), silenced };
        return silenced;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function warmSilentModeCache() {
  if (Platform.OS !== "ios" || !canDetectSilentMode()) return;
  cached = null;
  void readSilent();
}

/**
 * iOS mutes expo-speech when the silent switch is on. Android speech uses the
 * media volume, so ringer silent mode still plays and does not need this warning.
 */
export function warnIfSilentModeBlocksSpeech() {
  if (Platform.OS !== "ios") return;

  if (!canDetectSilentMode()) {
    if (hintedWithoutDetector) return;
    hintedWithoutDetector = true;
    showSilentModeToast(UNKNOWN_MESSAGE);
    return;
  }

  void readSilent().then((silenced) => {
    if (silenced) showSilentModeToast(DETECTED_MESSAGE);
    else if (silenced === false) hideSilentModeToast();
  });
}
