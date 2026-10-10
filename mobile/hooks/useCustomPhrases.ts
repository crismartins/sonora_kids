import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCustomPhrase,
  CustomPhrase,
  loadCustomPhrases,
  replaceCustomPhrase,
  saveCustomPhrases,
} from "@/services/customPhrases";
import { PhraseItem } from "@/types";

export function useCustomPhrases() {
  const [phrases, setPhrases] = useState<CustomPhrase[]>([]);
  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;

  useEffect(() => {
    let active = true;
    loadCustomPhrases()
      .then((stored) => {
        if (active) setPhrases(stored);
      })
      .catch(() => {
        if (active) setPhrases([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const addPhrase = useCallback(async (items: PhraseItem[]) => {
    const phrase = createCustomPhrase(items);
    const next = [phrase, ...phrasesRef.current];
    phrasesRef.current = next;
    setPhrases(next);
    await saveCustomPhrases(next);
    return phrase;
  }, []);

  const updatePhrase = useCallback(async (id: string, items: PhraseItem[]) => {
    const current = phrasesRef.current.find((phrase) => phrase.id === id);
    if (!current) throw new Error("Frase não encontrada");
    const phrase = replaceCustomPhrase(current, items);
    const next = phrasesRef.current.map((item) => (item.id === id ? phrase : item));
    phrasesRef.current = next;
    setPhrases(next);
    await saveCustomPhrases(next);
    return phrase;
  }, []);

  const deletePhrase = useCallback(async (id: string) => {
    const next = phrasesRef.current.filter((phrase) => phrase.id !== id);
    phrasesRef.current = next;
    setPhrases(next);
    await saveCustomPhrases(next);
  }, []);

  return { phrases, addPhrase, updatePhrase, deletePhrase };
}
