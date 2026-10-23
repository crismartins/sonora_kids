import { useEffect, useLayoutEffect, useRef } from "react";
import { router, useNavigation } from "expo-router";
import { AddPecForm, currentPecForm, finishPecForm } from "@/components/AddPecModal";

export default function PecScreen() {
  const navigation = useNavigation();
  const request = useRef(currentPecForm()).current;

  useLayoutEffect(() => {
    navigation.setOptions({ title: request?.initialPec ? "Editar PEC" : "Novo PEC" });
  }, [navigation, request]);

  useEffect(() => {
    if (!request) {
      router.back();
      return;
    }
    return navigation.addListener("beforeRemove", () => {
      finishPecForm();
    });
  }, [navigation, request]);

  if (!request) return null;

  return (
    <AddPecForm
      categories={request.categories}
      initialCategorySlug={request.initialCategorySlug}
      initialPec={request.initialPec}
      onSubmit={request.onSubmit}
      onClose={() => router.back()}
    />
  );
}
