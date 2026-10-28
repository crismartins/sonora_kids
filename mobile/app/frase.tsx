import { useEffect, useLayoutEffect, useRef } from "react";
import { router, useNavigation } from "expo-router";
import { AddPhraseForm, currentPhraseForm, finishPhraseForm } from "@/components/AddPhraseModal";

export default function FraseScreen() {
  const navigation = useNavigation();
  const request = useRef(currentPhraseForm()).current;

  useLayoutEffect(() => {
    navigation.setOptions({ title: request?.initialPhrase ? "Editar frase" : "Nova frase" });
  }, [navigation, request]);

  useEffect(() => {
    if (!request) {
      router.back();
      return;
    }
    const unsubscribe = navigation.addListener("removed", () => {
      finishPhraseForm();
    });
    return () => queueMicrotask(unsubscribe);
  }, [navigation, request]);

  if (!request) return null;

  return (
    <AddPhraseForm
      categories={request.categories}
      initialPhrase={request.initialPhrase}
      onSubmit={request.onSubmit}
      onClose={() => router.back()}
    />
  );
}
