import { useEffect, useLayoutEffect, useRef } from "react";
import { router, useNavigation } from "expo-router";
import { AddPecForm, currentPecForm, finishPecForm } from "@/components/AddPecModal";
import { useI18n } from "@/i18n";

export default function PecScreen() {
  const navigation = useNavigation();
  const copy = useI18n();
  const request = useRef(currentPecForm()).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: request?.imageOnly ? copy.nav.swapImage : request?.initialPec ? copy.nav.editPec : copy.nav.newPec,
    });
  }, [copy, navigation, request]);

  useEffect(() => {
    if (!request) {
      router.back();
      return;
    }
    const unsubscribe = navigation.addListener("removed", () => {
      finishPecForm();
    });
    return () => queueMicrotask(unsubscribe);
  }, [navigation, request]);

  if (!request) return null;

  return (
    <AddPecForm
      categories={request.categories}
      initialCategorySlug={request.initialCategorySlug}
      initialPec={request.initialPec}
      imageOnly={request.imageOnly}
      initialPreview={request.initialPreview}
      onSubmit={request.onSubmit}
      onRestore={request.onRestore}
      onClose={() => router.back()}
    />
  );
}
