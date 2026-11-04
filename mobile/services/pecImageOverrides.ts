import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";
import { pecBaseTitle } from "@/data/pecLabels";
import { removeStoredImage, savePickedImage } from "@/services/customPecs";

const STORAGE_KEY = "sonora.pecImageOverrides";
const FOLDER = "pec-images";

type StoredOverride = {
  id: string;
  title: string;
  localUri: string;
};

let records: StoredOverride[] = [];
const byId = new Map<string, string>();
const byTitle = new Map<string, string>();
let version = 0;
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;

function titleKey(title: string) {
  return pecBaseTitle(title).trim().toLocaleLowerCase("pt-BR");
}

function rebuild() {
  byId.clear();
  byTitle.clear();
  for (const record of records) {
    byId.set(record.id, record.localUri);
    byTitle.set(titleKey(record.title), record.id);
  }
}

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function isStored(value: unknown): value is StoredOverride {
  if (!value || typeof value !== "object") return false;
  const record = value as StoredOverride;
  return typeof record.id === "string" && typeof record.title === "string" && typeof record.localUri === "string";
}

function fileStillThere(uri: string) {
  if (uri.startsWith("data:") || uri.startsWith("http") || uri.startsWith("blob:")) return true;
  if (Platform.OS === "web") return true;
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}

async function persist() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

async function load() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    records = [];
    rebuild();
    emit();
    return;
  }
  const parsed: unknown = JSON.parse(raw);
  const stored = Array.isArray(parsed) ? parsed.filter(isStored) : [];
  const kept = stored.filter((record) => fileStillThere(record.localUri));
  records = kept;
  rebuild();
  if (kept.length !== stored.length) await persist();
  emit();
}

export function ensurePecImageOverridesLoaded() {
  if (!loading) {
    loading = load().catch(() => {
      records = [];
      rebuild();
      emit();
    });
  }
  return loading;
}

export function subscribePecImageOverrides(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function pecImageOverrideVersion() {
  return version;
}

export function pecImageOverride(id?: string, title?: string) {
  if (id) return byId.get(id);
  if (!title) return undefined;
  const sharedId = byTitle.get(titleKey(title));
  if (!sharedId) return undefined;
  return byId.get(sharedId);
}

export async function setPecImageOverride(id: string, title: string, sourceUri: string) {
  await ensurePecImageOverridesLoaded();
  const previous = byId.get(id);
  const localUri = await savePickedImage(FOLDER, id, sourceUri);
  if (previous && previous !== localUri) removeStoredImage(previous);
  records = [...records.filter((record) => record.id !== id), { id, title, localUri }];
  rebuild();
  await persist();
  emit();
}

export async function clearPecImageOverride(id: string) {
  await ensurePecImageOverridesLoaded();
  const previous = byId.get(id);
  if (!previous) return;
  removeStoredImage(previous);
  records = records.filter((record) => record.id !== id);
  rebuild();
  await persist();
  emit();
}
