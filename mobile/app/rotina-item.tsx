import { useEffect, useLayoutEffect, useRef } from "react";
import { router, useNavigation } from "expo-router";
import {
  AddRoutineForm,
  currentRoutineForm,
  finishRoutineForm,
  routineFormTitle,
} from "@/components/AddRoutineItemModal";
import { useI18n } from "@/i18n";

export default function RotinaItemScreen() {
  const navigation = useNavigation();
  const copy = useI18n();
  const request = useRef(currentRoutineForm()).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: request ? routineFormTitle(request.day, request.period) : copy.nav.routine,
    });
  }, [copy, navigation, request]);

  useEffect(() => {
    if (!request) {
      router.back();
      return;
    }
    const unsubscribe = navigation.addListener("removed", () => {
      finishRoutineForm();
    });
    return () => queueMicrotask(unsubscribe);
  }, [navigation, request]);

  if (!request) return null;

  return (
    <AddRoutineForm
      initialSelected={request.initialSelected}
      getCategories={request.getCategories}
      addPec={request.addPec}
      beforeCreatePec={request.beforeCreatePec}
      onSubmit={request.onSubmit}
      onClose={() => router.back()}
    />
  );
}
