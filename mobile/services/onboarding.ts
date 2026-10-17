import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sonora.onboarding.seen";

export async function loadOnboardingSeen(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw === "1";
}

export async function markOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, "1");
}
