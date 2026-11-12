import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { SolarIcon } from "@/components/SolarIcon";
import { Button, IconButton } from "@/components/Button";
import { ScreenTitle } from "@/components/ScreenTitle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useI18n } from "@/i18n";

export function activityPadding(bottomInset: number) {
  return {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: bottomInset + 24,
  };
}

export function ActivityPrompt({
  instruction,
  steps,
}: {
  instruction: string;
  steps?: { done: number; total: number };
}) {
  const copy = useI18n();
  const total = Math.max(0, steps?.total ?? 0);
  const done = Math.min(total, Math.max(0, steps?.done ?? 0));

  return (
    <View className="pb-5">
      <Text className="text-center font-quicksand text-lg text-neutral-dark">{instruction}</Text>
      {total > 0 ? (
        <View
          accessibilityLabel={copy.common.of(done, total)}
          className="flex-row flex-wrap items-center justify-center gap-2 pt-3"
        >
          {Array.from({ length: total }, (_, index) => {
            const step = index + 1;
            const complete = step <= done;
            return (
              <View
                key={step}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: complete ? "transparent" : colors.light }}
              >
                {complete ? (
                  <SolarIcon name="check-circle" size={36} color={colors.primary} />
                ) : (
                  <Text className="font-quicksand text-base text-primary">{step}</Text>
                )}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export function ActivityChrome({
  title,
  announce = true,
  onBack,
  children,
}: {
  title: string;
  announce?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { settings, speak } = useAppSettings();
  const copy = useI18n();
  const announced = useRef(false);

  useEffect(() => {
    if (!announce || announced.current || !settings.autoSpeakCategories) return;
    announced.current = true;
    speak(title);
  }, [announce, settings.autoSpeakCategories, speak, title]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="h-14 flex-row items-center px-2">
        <IconButton
          icon="arrow-left"
          variant="ghost"
          size="md"
          accessibilityLabel={copy.common.back}
          onPress={() => (onBack ? onBack() : router.back())}
        />
        <ScreenTitle className="flex-1 text-center">{title}</ScreenTitle>
        <View className="w-12" />
      </View>
      {children}
    </View>
  );
}

export function ActivityDone({
  title,
  detail,
  againLabel,
  onAgain,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  detail: string;
  againLabel: string;
  onAgain: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { speak } = useAppSettings();

  useEffect(() => {
    speak(title);
  }, [speak, title]);

  return (
    <View className="flex-1 items-center justify-center px-8" style={{ paddingBottom: insets.bottom + 24 }}>
      <View
        className="mb-5 h-28 w-28 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.goldSoft }}
      >
        <SolarIcon name="trophy" size={64} color={colors.gold} secondaryColor={colors.goldLight} secondaryOpacity={0.85} />
      </View>
      <Text className="text-center font-quicksand text-4xl text-dark">{title}</Text>
      <Text className="mt-2 text-center font-quicksand text-xl text-neutral-dark">{detail}</Text>
      <Button label={againLabel} labelSize="md" className="mt-8 w-full" onPress={onAgain} />
      {secondaryLabel && onSecondary ? (
        <Button label={secondaryLabel} variant="ghost" labelSize="md" className="mt-3 w-full" onPress={onSecondary} />
      ) : null}
    </View>
  );
}
