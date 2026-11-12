import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { SolarIcon } from "@/components/SolarIcon";
import { colors } from "@/constants/colors";
import { closePaywall, markPaywallClosed, markPaywallOpen, usePremium } from "@/context/PremiumContext";
import { useI18n } from "@/i18n";
import { FREE_LIMITS } from "@/services/quota";
import { PurchaseOutcome, RestoreOutcome } from "@/services/purchases";

const SCRIM = "rgba(0, 29, 74, 0.58)";

export function PremiumPaywall() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const copy = useI18n();
  const { isPremium, purchase, restore, loadPrice } = usePremium();
  const [price, setPrice] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    markPaywallOpen();
    return () => markPaywallClosed();
  }, []);

  useEffect(() => {
    if (isPremium) return;
    let active = true;
    loadPrice().then((value) => {
      if (active) setPrice(value);
    });
    return () => {
      active = false;
    };
  }, [isPremium, loadPrice]);

  const busy = purchasing || restoring;

  const showOutcome = (outcome: PurchaseOutcome | RestoreOutcome) => {
    if (outcome === "purchased" || outcome === "restored" || outcome === "cancelled") return;
    const notice = {
      unavailable: copy.premium.unavailable,
      missing: copy.premium.missing,
      failed: copy.premium.failed,
      pending: copy.premium.pending,
      empty: copy.premium.restoreEmpty,
    }[outcome];
    setMessage(notice);
  };

  const onPurchase = async () => {
    setPurchasing(true);
    setMessage(null);
    try {
      const outcome = await purchase();
      if (outcome === "purchased") {
        closePaywall();
        return;
      }
      showOutcome(outcome);
    } finally {
      setPurchasing(false);
    }
  };

  const onRestore = async () => {
    setRestoring(true);
    setMessage(null);
    try {
      const outcome = await restore();
      if (outcome === "restored") {
        closePaywall();
        return;
      }
      showOutcome(outcome);
    } finally {
      setRestoring(false);
    }
  };

  const rows = [
    { label: copy.premium.pecs, free: String(FREE_LIMITS.pec), premium: copy.premium.unlimited, highlight: true },
    { label: copy.premium.phrases, free: String(FREE_LIMITS.phrase), premium: copy.premium.unlimited, highlight: true },
    { label: copy.premium.routine, free: String(FREE_LIMITS.routine), premium: copy.premium.unlimited, highlight: true },
    { label: copy.premium.library, free: copy.premium.included, premium: copy.premium.included, highlight: false },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: SCRIM }}>
      <Pressable accessibilityLabel={copy.common.close} onPress={closePaywall} style={StyleSheet.absoluteFill} />
      <View
        pointerEvents="box-none"
        className="flex-1 justify-center px-4"
        style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}
      >
      <View
        className="w-full max-w-[420px] self-center overflow-hidden rounded-[28px] bg-white"
        style={{ maxHeight: height - insets.top - insets.bottom - 24, ...CARD_SHADOW }}
      >
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <View className="overflow-hidden px-6 pb-6 pt-7" style={{ backgroundColor: colors.primary }}>
            <View style={ORB_LARGE} />
            <View style={ORB_SMALL} />
            <View
              className="mb-4 h-16 w-16 items-center justify-center rounded-[20px]"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <SolarIcon name={isPremium ? "check-circle" : "crown"} size={34} color={colors.white} />
            </View>
            <Text className="font-quicksand text-sm uppercase tracking-widest" style={{ color: colors.light }}>
              {copy.premium.kicker}
            </Text>
            <Text className="mt-1 font-quicksand text-4xl text-white">
              {isPremium ? copy.premium.ownedTitle : copy.premium.title}
            </Text>
            <Text className="mt-2 font-quicksand text-lg" style={{ color: colors.light }}>
              {isPremium ? copy.premium.ownedBody : copy.premium.subtitle}
            </Text>
          </View>

          {isPremium ? (
            <View className="px-5 pb-6 pt-5">
              <Button label={copy.premium.continue} icon="check-circle" onPress={closePaywall} />
            </View>
          ) : (
            <View className="px-5 pb-6 pt-5">
              <View className="overflow-hidden rounded-2xl border border-line">
                <View className="flex-row items-center bg-canvas px-3 py-3">
                  <View className="flex-[1.4]" />
                  <Text className="flex-1 text-center font-quicksand text-base text-neutral-dark">{copy.premium.free}</Text>
                  <Text className="flex-1 text-center font-quicksand text-base text-primary">{copy.premium.premium}</Text>
                </View>
                {rows.map((row) => (
                  <View key={row.label} className="flex-row items-center border-t border-line px-3 py-3">
                    <Text className="flex-[1.4] pr-2 font-quicksand text-base text-dark">{row.label}</Text>
                    <Text className="flex-1 text-center font-quicksand text-base text-neutral-dark">{row.free}</Text>
                    <View className="flex-1 items-center">
                      <View className={`rounded-full px-2 py-1 ${row.highlight ? "bg-primary-soft" : ""}`}>
                        <Text className={`text-center font-quicksand text-base ${row.highlight ? "text-primary" : "text-dark"}`}>
                          {row.premium}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <Text className="mb-4 mt-4 text-center font-quicksand text-base text-neutral-dark">{copy.premium.keep}</Text>

              <Button
                label={price ? copy.premium.unlockPrice(price) : copy.premium.unlock}
                icon="crown"
                elevated
                loading={purchasing}
                disabled={busy}
                onPress={onPurchase}
              />
              <Pressable
                accessibilityLabel={copy.premium.restore}
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={onRestore}
                className="mt-3 items-center py-2"
              >
                <Text className="font-quicksand text-lg text-primary" style={{ opacity: busy ? 0.5 : 1 }}>
                  {copy.premium.restore}
                </Text>
              </Pressable>
              <Pressable accessibilityLabel={copy.premium.later} disabled={busy} onPress={closePaywall} className="items-center py-2">
                <Text className="font-quicksand text-lg text-neutral-dark">{copy.premium.later}</Text>
              </Pressable>
              {message ? <Text className="mt-2 text-center font-quicksand text-base text-danger">{message}</Text> : null}
            </View>
          )}
        </ScrollView>
      </View>
      </View>
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: colors.dark,
  shadowOpacity: 0.28,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 12 },
  elevation: 12,
};

const ORB_LARGE = {
  position: "absolute" as const,
  width: 150,
  height: 150,
  borderRadius: 75,
  backgroundColor: "rgba(255,255,255,0.14)",
  top: -48,
  right: -36,
};

const ORB_SMALL = {
  position: "absolute" as const,
  width: 90,
  height: 90,
  borderRadius: 45,
  backgroundColor: "rgba(255,255,255,0.12)",
  bottom: -28,
  left: -16,
};
