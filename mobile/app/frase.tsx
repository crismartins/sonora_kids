import { useEffect, useLayoutEffect, useRef } from "react";
import { router, useNavigation } from "expo-router";
import { AddPhraseForm, currentPhraseForm, finishPhraseForm } from "@/components/AddPhraseModal";
import { useI18n } from "@/i18n";

export default function FraseScreen() {
  const navigation = useNavigation();
  const copy = useI18n();
  const request = useRef(currentPhraseForm()).current;

  useLayoutEffect(() => {
    navigation.setOptions({ title: request?.initialPhrase ? copy.nav.editPhrase : copy.nav.newPhrase });
  }, [copy, navigation, request]);

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
