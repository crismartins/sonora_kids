import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePremium } from "@/context/PremiumContext";
import {
  addSharedCustomPec,
  deleteSharedCustomPec,
  ensureCustomPecsLoaded,
  getCustomPecs,
  NewCustomPec,
  subscribeCustomPecs,
  updateSharedCustomPec,
} from "@/services/customPecs";

export function useCustomPecs() {
  const { ensureCanAdd } = usePremium();
  const pecs = useSyncExternalStore(subscribeCustomPecs, getCustomPecs, getCustomPecs);

  useEffect(() => {
    void ensureCustomPecsLoaded();
  }, []);

  const addPec = useCallback(
    (input: NewCustomPec) => addSharedCustomPec(input, (count) => ensureCanAdd("pec", count)),
    [ensureCanAdd],
  );

  const updatePec = useCallback((id: string, input: NewCustomPec) => updateSharedCustomPec(id, input), []);

  const deletePec = useCallback((id: string) => deleteSharedCustomPec(id), []);

  return { pecs, addPec, updatePec, deletePec };
}
