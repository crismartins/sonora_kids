import { useCallback, useEffect, useRef, useState } from "react";
import {
  DayPeriod,
  RoutineItem,
  loadRoutine,
  routineSlotKey,
  saveRoutine,
} from "@/services/routine";

export function useRoutine() {
  const [slots, setSlots] = useState<Record<string, RoutineItem[]>>({});
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  useEffect(() => {
    let active = true;
    loadRoutine()
      .then((stored) => {
        if (active) setSlots(stored);
      })
      .catch(() => {
        if (active) setSlots({});
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: Record<string, RoutineItem[]>) => {
    slotsRef.current = next;
    setSlots(next);
    await saveRoutine(next);
  }, []);

  const addItem = useCallback(
    async (day: number, period: DayPeriod, pec: { id: string; title: string }) => {
      const key = routineSlotKey(day, period);
      const current = slotsRef.current[key] ?? [];
      if (current.some((item) => item.pecId === pec.id)) return;
      const item: RoutineItem = {
        id: `routine-${Date.now()}`,
        pecId: pec.id,
        title: pec.title,
      };
      await persist({ ...slotsRef.current, [key]: [...current, item] });
    },
    [persist],
  );

  const removeItem = useCallback(
    async (day: number, period: DayPeriod, itemId: string) => {
      const key = routineSlotKey(day, period);
      const current = slotsRef.current[key] ?? [];
      await persist({
        ...slotsRef.current,
        [key]: current.filter((item) => item.id !== itemId),
      });
    },
    [persist],
  );

  const itemsFor = useCallback(
    (day: number, period: DayPeriod) => slots[routineSlotKey(day, period)] ?? [],
    [slots],
  );

  return { itemsFor, addItem, removeItem };
}
