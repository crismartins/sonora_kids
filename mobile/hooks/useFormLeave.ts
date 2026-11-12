import { useEffect } from "react";
import { useNavigation } from "expo-router";

/**
 * Releases a form lock when the screen leaves.
 * `removed` fires after effect cleanup, so the listener stays until the next microtask.
 * If that event never arrives, a screen that is already gone still drops the lock.
 */
export function useFormLeave(active: boolean, held: () => boolean, release: () => void) {
  const navigation = useNavigation();

  useEffect(() => {
    if (!active) return;
    const unsubscribe = navigation.addListener("removed", release);
    return () => {
      queueMicrotask(() => {
        unsubscribe();
        if (!navigation.isFocused() && held()) release();
      });
    };
  }, [active, held, navigation, release]);
}
