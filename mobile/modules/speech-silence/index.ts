import { requireOptionalNativeModule } from "expo-modules-core";

type SpeechSilenceNative = {
  isSilentModeEnabled(): Promise<boolean>;
};

const native = requireOptionalNativeModule<SpeechSilenceNative>("SpeechSilence");

export function canDetectSilentMode() {
  return native != null;
}

/** `null` when this binary cannot read the silent switch (Expo Go, web). */
export async function isSilentModeEnabled(): Promise<boolean | null> {
  if (!native) return null;
  try {
    return await native.isSilentModeEnabled();
  } catch {
    return null;
  }
}
