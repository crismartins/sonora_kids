import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Voice } from "expo-speech";
import {
  AppSettings,
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
  speak: (text: string, override?: Partial<AppSettings>) => void;
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
  settingsRef.current = settings;
  voicesRef.current = voices;

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

  const speak = useCallback((text: string, override?: Partial<AppSettings>) => {
    const current = { ...settingsRef.current, ...override };
    const resolved = resolveSpeech(voicesRef.current, current);
    Speech.stop();
    Speech.speak(text, {
      language: resolved.language,
      pitch: resolved.pitch,
      rate: SPEECH_RATES[current.speechRate],
      ...(resolved.voice ? { voice: resolved.voice } : {}),
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
  }, []);

  const haptic = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (!settingsRef.current.haptics || Platform.OS === "web") return;
    Haptics.impactAsync(style);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      settings,
      fontScale: settings.largeText ? LARGE_FONT_SCALE : 1,
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
