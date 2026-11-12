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

export function countRoutineItems(slots: Record<string, RoutineItem[]>) {
  return Object.values(slots).reduce((sum, items) => sum + items.length, 0);
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

let slots: Record<string, RoutineItem[]> = {};
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;
let queue: Promise<void> = Promise.resolve();
let itemSerial = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function ensureRoutineLoaded() {
  if (!loading) {
    loading = loadRoutine()
      .then((stored) => {
        slots = stored;
        emit();
      })
      .catch(() => {
        slots = {};
        emit();
      });
  }
  return loading;
}

export function subscribeRoutine(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRoutineSlots() {
  return slots;
}

export function addRoutineItem(day: number, period: DayPeriod, pec: { id: string; title: string }) {
  return enqueue(async () => {
    await ensureRoutineLoaded();
    const key = routineSlotKey(day, period);
    const current = slots[key] ?? [];
    if (current.some((item) => item.pecId === pec.id)) return;
    const item: RoutineItem = {
      id: `routine-${Date.now()}-${itemSerial++}`,
      pecId: pec.id,
      title: pec.title,
    };
    const next = { ...slots, [key]: [...current, item] };
    await saveRoutine(next);
    slots = next;
    emit();
  });
}

export function removeRoutineItem(day: number, period: DayPeriod, itemId: string) {
  return enqueue(async () => {
    await ensureRoutineLoaded();
    const key = routineSlotKey(day, period);
    const current = slots[key] ?? [];
    const kept = current.filter((item) => item.id !== itemId);
    if (kept.length === current.length) return;
    const next = { ...slots, [key]: kept };
    await saveRoutine(next);
    slots = next;
    emit();
  });
}

export function removePecFromRoutine(pecId: string) {
  return enqueue(async () => {
    await ensureRoutineLoaded();
    let changed = false;
    const next: Record<string, RoutineItem[]> = {};
    for (const [key, items] of Object.entries(slots)) {
      const kept = items.filter((item) => item.pecId !== pecId);
      if (kept.length !== items.length) changed = true;
      next[key] = kept;
    }
    if (!changed) return;
    await saveRoutine(next);
    slots = next;
    emit();
  });
}
