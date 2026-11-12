import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  DayPeriod,
  addRoutineItem,
  countRoutineItems,
  ensureRoutineLoaded,
  getRoutineSlots,
  removeRoutineItem,
  routineSlotKey,
  subscribeRoutine,
} from "@/services/routine";

export function useRoutine() {
  const slots = useSyncExternalStore(subscribeRoutine, getRoutineSlots, getRoutineSlots);

  useEffect(() => {
    void ensureRoutineLoaded();
  }, []);

  const addItem = useCallback(
    (day: number, period: DayPeriod, pec: { id: string; title: string }) => addRoutineItem(day, period, pec),
    [],
  );

  const removeItem = useCallback(
    (day: number, period: DayPeriod, itemId: string) => removeRoutineItem(day, period, itemId),
    [],
  );

  const itemsFor = useCallback(
    (day: number, period: DayPeriod) => slots[routineSlotKey(day, period)] ?? [],
    [slots],
  );

  const itemsNow = useCallback(
    (day: number, period: DayPeriod) => getRoutineSlots()[routineSlotKey(day, period)] ?? [],
    [],
  );

  const countItems = useCallback(() => countRoutineItems(getRoutineSlots()), []);

  return { itemsFor, itemsNow, countItems, addItem, removeItem };
}
