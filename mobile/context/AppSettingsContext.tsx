import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Voice } from "expo-speech";
import { setActiveLocale } from "@/i18n/locale";
import { warmSilentModeCache, warnIfSilentModeBlocksSpeech } from "@/services/silentMode";
import {
  AppSettings,
  DEFAULT_FONT_SCALE,
  DEFAULT_SETTINGS,
  LARGE_FONT_SCALE,
  loadAppSettings,
  resolveSpeech,
  saveAppSettings,
  SPEECH_RATES,
} from "@/services/appSettings";

interface AppSettingsContextValue {
  ready: boolean;
  settings: AppSettings;
  fontScale: number;
  voices: Voice[];
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  speak: (text: string, override?: Partial<AppSettings>, onDone?: () => void) => void;
  stopSpeaking: () => void;
  haptic: (style?: Haptics.ImpactFeedbackStyle) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [ready, setReady] = useState(false);
  const settingsRef = useRef(settings);
  const voicesRef = useRef(voices);
  const speakGeneration = useRef(0);
  const speakTask = useRef<ReturnType<typeof setTimeout> | null>(null);
  settingsRef.current = settings;
  voicesRef.current = voices;
  setActiveLocale(settings.language);

  useEffect(() => {
    return () => {
      if (speakTask.current) clearTimeout(speakTask.current);
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadAppSettings()
      .then((stored) => {
        if (!active) return;
        settingsRef.current = stored;
        setSettings(stored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    warmSilentModeCache();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") warmSilentModeCache();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let active = true;
    Speech.getAvailableVoicesAsync()
      .then((available) => {
        if (active) setVoices(available);
      })
      .catch(() => {
        if (active) setVoices([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    await saveAppSettings(next);
  }, []);

  const resetSettings = useCallback(async () => {
    settingsRef.current = DEFAULT_SETTINGS;
    setSettings(DEFAULT_SETTINGS);
    await saveAppSettings(DEFAULT_SETTINGS);
  }, []);

  const scheduleSpeech = useCallback((task: () => void) => {
    if (speakTask.current) clearTimeout(speakTask.current);
    const generation = ++speakGeneration.current;
    // TTS stop/speak can block the JS thread for the whole utterance.
    // Yield so the press paints before the native call starts.
    speakTask.current = setTimeout(() => {
      speakTask.current = null;
      if (generation !== speakGeneration.current) return;
      task();
    }, 0);
  }, []);

  const speak = useCallback((text: string, override?: Partial<AppSettings>, onDone?: () => void) => {
    const utterance = text.trim();
    if (!utterance) return;
    const snapshot = { ...settingsRef.current, ...override };
    scheduleSpeech(() => {
      warnIfSilentModeBlocksSpeech();
      const resolved = resolveSpeech(voicesRef.current, snapshot);
      void Speech.stop().catch(() => undefined);
      Speech.speak(utterance, {
        language: resolved.language,
        pitch: resolved.pitch,
        rate: SPEECH_RATES[snapshot.speechRate],
        ...(resolved.voice ? { voice: resolved.voice } : {}),
        onDone: () => onDone?.(),
      });
    });
  }, [scheduleSpeech]);

  const stopSpeaking = useCallback(() => {
    scheduleSpeech(() => {
      void Speech.stop().catch(() => undefined);
    });
  }, [scheduleSpeech]);

  const haptic = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (!settingsRef.current.haptics || Platform.OS === "web") return;
    Haptics.impactAsync(style);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      settings,
      fontScale: settings.largeText ? LARGE_FONT_SCALE : DEFAULT_FONT_SCALE,
      voices,
      updateSettings,
      resetSettings,
      speak,
      stopSpeaking,
      haptic,
    }),
    [ready, settings, voices, updateSettings, resetSettings, speak, stopSpeaking, haptic],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const value = useContext(AppSettingsContext);
  if (!value) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return value;
}
