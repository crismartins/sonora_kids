import AsyncStorage from "@react-native-async-storage/async-storage";
import { PhraseItem } from "@/types";

const STORAGE_KEY = "sonora.customPhrases";

export interface CustomPhrase {
  id: string;
  items: PhraseItem[];
}

function isPhraseItem(value: unknown): value is PhraseItem {
  if (!value || typeof value !== "object") return false;
  const item = value as PhraseItem;
  return typeof item.text === "string" && item.text.trim().length > 0 && typeof item.color === "string";
}

function isCustomPhrase(value: unknown): value is CustomPhrase {
  if (!value || typeof value !== "object") return false;
  const phrase = value as CustomPhrase;
  return (
    typeof phrase.id === "string" &&
    Array.isArray(phrase.items) &&
    phrase.items.length > 0 &&
    phrase.items.every(isPhraseItem)
  );
}

export async function loadCustomPhrases(): Promise<CustomPhrase[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isCustomPhrase);
}

export async function saveCustomPhrases(phrases: CustomPhrase[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
}

function storedItem(item: PhraseItem): PhraseItem {
  const next: PhraseItem = { text: item.text.trim(), color: item.color };
  if (typeof item.image === "string" && item.image) next.image = item.image;
  return next;
}

export function createCustomPhrase(items: PhraseItem[]): CustomPhrase {
  return {
    id: `phrase-${Date.now()}`,
    items: items.map(storedItem),
  };
}

export function replaceCustomPhrase(current: CustomPhrase, items: PhraseItem[]): CustomPhrase {
  return {
    ...current,
    items: items.map(storedItem),
  };
}
