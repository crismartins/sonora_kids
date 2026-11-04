import { useEffect, useSyncExternalStore } from "react";
import {
  ensurePecImageOverridesLoaded,
  pecImageOverrideVersion,
  subscribePecImageOverrides,
} from "@/services/pecImageOverrides";

export function usePecImageOverrides() {
  useEffect(() => {
    void ensurePecImageOverridesLoaded();
  }, []);
  return useSyncExternalStore(subscribePecImageOverrides, pecImageOverrideVersion, pecImageOverrideVersion);
}
