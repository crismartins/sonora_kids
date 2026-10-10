import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sonora.routine";

export const DAY_PERIODS = ["manha", "tarde", "noite"] as const;
export type DayPeriod = (typeof DAY_PERIODS)[number];

export const PERIOD_LABELS: Record<DayPeriod, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

export const DAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export interface RoutineItem {
  id: string;
  pecId: string;
  title: string;
}

interface StoredRoutine {
  slots: Record<string, RoutineItem[]>;
}

export function routineSlotKey(day: number, period: DayPeriod) {
  return `${day}:${period}`;
}

function isRoutineItem(value: unknown): value is RoutineItem {
  if (!value || typeof value !== "object") return false;
  const item = value as RoutineItem;
  return typeof item.id === "string" && typeof item.pecId === "string" && typeof item.title === "string";
}

function isStoredRoutine(value: unknown): value is StoredRoutine {
  if (!value || typeof value !== "object") return false;
  const slots = (value as StoredRoutine).slots;
  if (!slots || typeof slots !== "object") return false;
  return Object.values(slots).every(
    (items) => Array.isArray(items) && items.every(isRoutineItem),
  );
}

export async function loadRoutine(): Promise<Record<string, RoutineItem[]>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!isStoredRoutine(parsed)) return {};
  return parsed.slots;
}

export async function saveRoutine(slots: Record<string, RoutineItem[]>): Promise<void> {
  const stored: StoredRoutine = { slots };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}
