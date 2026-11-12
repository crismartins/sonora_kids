import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { router } from "expo-router";
import { FREE_LIMITS, QuotaError, QuotaKind } from "@/services/quota";
import {
  PurchaseOutcome,
  RestoreOutcome,
  configurePurchases,
  loadPremiumPrice,
  purchasePremium,
  readPremiumCache,
  refreshPremium,
  restorePremium,
  watchPremium,
  writePremiumCache,
} from "@/services/purchases";

type PremiumContextValue = {
  isPremium: boolean;
  canAdd: (kind: QuotaKind, currentCount: number) => boolean;
  ensureCanAdd: (kind: QuotaKind, currentCount: number) => void;
  openPaywall: () => void;
  purchase: () => Promise<PurchaseOutcome>;
  restore: () => Promise<RestoreOutcome>;
  loadPrice: () => Promise<string | null>;
};

const PremiumContext = createContext<PremiumContextValue | null>(null);

let paywallVisible = false;

function openPaywallRoute() {
  if (paywallVisible) return;
  paywallVisible = true;
  router.push("/premium");
}

export function closePaywall() {
  paywallVisible = false;
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

export function markPaywallOpen() {
  paywallVisible = true;
}

export function markPaywallClosed() {
  paywallVisible = false;
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);

  const applyPremium = useCallback((value: boolean) => {
    setIsPremium(value);
    void writePremiumCache(value);
  }, []);

  useEffect(() => {
    let active = true;
    let stopWatching = () => {};

    (async () => {
      try {
        const cached = await readPremiumCache();
        if (!active) return;
        if (cached) setIsPremium(true);
        const ready = await configurePurchases();
        if (!active || !ready) return;
        stopWatching = watchPremium((value) => {
          if (active) applyPremium(value);
        });
        if (!active) {
          stopWatching();
          return;
        }
        const value = await refreshPremium();
        if (active && value != null) applyPremium(value);
      } catch {
        // Keep the last unlock when the store cannot be reached.
      }
    })();

    return () => {
      active = false;
      stopWatching();
    };
  }, [applyPremium]);

  const openPaywall = useCallback(() => {
    openPaywallRoute();
  }, []);

  const canAdd = useCallback(
    (kind: QuotaKind, currentCount: number) => isPremium || currentCount < FREE_LIMITS[kind],
    [isPremium],
  );

  const ensureCanAdd = useCallback(
    (kind: QuotaKind, currentCount: number) => {
      if (canAdd(kind, currentCount)) return;
      openPaywall();
      throw new QuotaError();
    },
    [canAdd, openPaywall],
  );

  const purchase = useCallback(async () => {
    const outcome = await purchasePremium();
    if (outcome === "purchased") applyPremium(true);
    return outcome;
  }, [applyPremium]);

  const restore = useCallback(async () => {
    const outcome = await restorePremium();
    if (outcome === "restored") applyPremium(true);
    return outcome;
  }, [applyPremium]);

  const value = useMemo(
    () => ({ isPremium, canAdd, ensureCanAdd, openPaywall, purchase, restore, loadPrice: loadPremiumPrice }),
    [isPremium, canAdd, ensureCanAdd, openPaywall, purchase, restore],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const value = useContext(PremiumContext);
  if (!value) throw new Error("usePremium must be used within PremiumProvider");
  return value;
}
