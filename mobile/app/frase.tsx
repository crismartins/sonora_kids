import { useEffect, useLayoutEffect, useRef } from "react";
import { router, useNavigation } from "expo-router";
import { AddPhraseForm, currentPhraseForm, finishPhraseForm, isPhraseFormOpen } from "@/components/AddPhraseModal";
import { useFormLeave } from "@/hooks/useFormLeave";
import { useI18n } from "@/i18n";

export default function FraseScreen() {
  const navigation = useNavigation();
  const copy = useI18n();
  const request = useRef(currentPhraseForm()).current;

  useLayoutEffect(() => {
    navigation.setOptions({ title: request?.initialPhrase ? copy.nav.editPhrase : copy.nav.newPhrase });
  }, [copy, navigation, request]);

  useEffect(() => {
    if (request) return;
    finishPhraseForm();
    router.back();
  }, [request]);

  useFormLeave(request != null, isPhraseFormOpen, finishPhraseForm);

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
