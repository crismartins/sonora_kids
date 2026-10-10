import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCustomPec,
  CustomPec,
  deleteCustomPecImage,
  loadCustomPecs,
  NewCustomPec,
  saveCustomPecs,
  updateCustomPec,
} from "@/services/customPecs";

export function useCustomPecs() {
  const [pecs, setPecs] = useState<CustomPec[]>([]);
  const pecsRef = useRef(pecs);
  pecsRef.current = pecs;

  useEffect(() => {
    let active = true;
    loadCustomPecs()
      .then((stored) => {
        if (active) setPecs(stored);
      })
      .catch(() => {
        if (active) setPecs([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const addPec = useCallback(async (input: NewCustomPec) => {
    const pec = await createCustomPec(input);
    const next = [...pecsRef.current, pec];
    pecsRef.current = next;
    setPecs(next);
    await saveCustomPecs(next);
    return pec;
  }, []);

  const updatePec = useCallback(async (id: string, input: NewCustomPec) => {
    const current = pecsRef.current.find((pec) => pec.id === id);
    if (!current) throw new Error("PEC não encontrado");
    const pec = await updateCustomPec(current, input);
    const next = pecsRef.current.map((item) => (item.id === id ? pec : item));
    pecsRef.current = next;
    setPecs(next);
    await saveCustomPecs(next);
    return pec;
  }, []);

  const deletePec = useCallback(async (id: string) => {
    const current = pecsRef.current.find((pec) => pec.id === id);
    if (!current) return;
    await deleteCustomPecImage(current);
    const next = pecsRef.current.filter((pec) => pec.id !== id);
    pecsRef.current = next;
    setPecs(next);
    await saveCustomPecs(next);
  }, []);

  return { pecs, addPec, updatePec, deletePec };
}
